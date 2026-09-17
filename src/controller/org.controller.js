import { raw } from "mysql2";
import { Organization, OrgLocation, OrgMember, Positions, Post, PostInfo, Status, User, UserProfile } from "../db/mysql/index.js";
import { catchErrorResponse, catchSuccessResponse } from "../util/common.js";
import { positions } from "../util/constant.js";
import { Op } from "sequelize";

import { sequelize } from "../config/database.js";


export const createOrganization = async (req, res) => {
    let errorMessage = '';
    try {
        const transaction = await sequelize.transaction();
        const user_id = req.user_id;
        const owner_user_id = user_id;
        const { org_code, name, email, contact_number, street, city, country, pin_code } = req.body;

        const sameCodeOrg = await Organization.count({ where: { org_code, } });

        if (sameCodeOrg > 0) {
            await transaction.rollback();
            errorMessage = 'This organization code has already been used by another organization. Please change & try again!';
            return res.status(400).json(catchErrorResponse(errorMessage));
        }

        const organization = await Organization.create(
            { org_code, owner_user_id, name, email, contact_number },
            { transaction },
        );
        const org_id = organization?.org_id;

        if (!org_id) {
            await transaction.rollback();
            errorMessage = 'Failed while creating the organization. Please try again!';
            return res.status(400).json(catchErrorResponse(errorMessage));
        }

        const orgLocation = await OrgLocation.create(
            { org_id, street, city, country, pin_code },
            { transaction },
        );

        if (!orgLocation) {
            await transaction.rollback();
            errorMessage = 'Failed while storing organization localion. Please try again!';
            return res.status(400).json(catchErrorResponse(errorMessage));
        }

        const position = await Positions.findOne({
            where: { position: positions['1'] },
            attributes: ['position_id'],
            raw: true
        });

        if (!position) {
            await transaction.rollback();
            throw new Error('Position not found');
        }

        const orgMember = await OrgMember.create(
            { org_id, user_id, member_position_id: position?.position_id },
            { transaction },
        );

        if (!orgMember) {
            await transaction.rollback();
            errorMessage = 'Failed while providing ownership of the organization. Please try again!';
            return res.status(400).json(catchErrorResponse(errorMessage));
        }

        await transaction.commit();
        const data = { organization, orgLocation, orgMember };
        return res.status(201).json(catchSuccessResponse(`Organization ${organization?.name} created successfully`, data));

    } catch (error) {
        await transaction.rollback();
        errorMessage = error.message;
        console.log(`ERROR: ${req.method} ${req.baseUrl}${req.path} - Error: ${error}`);
        return res.status(500).json(catchErrorResponse(errorMessage));
    }
}



export const allOrganization = async (req, res) => {
    let errorMessage = '';
    try {
        const user_id = req.user_id;

        const orgMember = await OrgMember.findAll({
            where: { user_id },
            include: [
                {
                    model: Organization,
                    as: "organization",
                    include: [
                        {
                            model: OrgLocation,
                            as: "orgLocation",
                        },
                        {
                            model: OrgMember,
                            as: "orgMember",
                            include: [
                                {
                                    model: User,
                                    as: "user",
                                    include: [
                                        {
                                            model: UserProfile,
                                            as: "userProfile",
                                            attributes: ['profile_id', 'user_id', 'name', 'gender', 'profile_image_url',],
                                        },
                                    ],
                                },
                                {
                                    model: Positions,
                                    as: "position",
                                },
                            ],
                        },
                    ],
                },
                {
                    model: Positions,
                    as: "position",
                },
            ],
        });

        if (!orgMember.length) return res.status(200).json(catchSuccessResponse('User is not a part of any organization'));

        const userOwnOrgInfo = orgMember.filter(memberInfo => {
            return memberInfo.position.position_id === 1
        });

        const userOtherOrgInfo = orgMember.filter(memberInfo => {
            return memberInfo.position.position_id !== 1
        });

        const data = { userOwnOrgInfo, userOtherOrgInfo };
        return res.status(200).json(catchSuccessResponse('User all organization list fetched successfully', data));

    } catch (error) {
        errorMessage = error.message;
        console.log(`ERROR: ${req.method} ${req.baseUrl}${req.path} - Error: ${error}`);
        return res.status(500).json(catchErrorResponse(errorMessage));
    }
}



export const organization = async (req, res) => {
    let errorMessage = '';
    try {
        const org_id = req.params.org_id;

        const organization = await Organization.findByPk(org_id,
            {
                include: [
                    {
                        model: User,
                        as: "user"
                    },
                    {
                        model: OrgLocation,
                        as: "orgLocation",
                    },
                    {
                        model: OrgMember,
                        as: "orgMember",
                        include: [
                            {
                                model: User,
                                as: "user",
                                include: [
                                    {
                                        model: UserProfile,
                                        as: "userProfile",
                                        attributes: ['profile_id', 'user_id', 'name', 'gender', 'profile_image_url',],
                                    },
                                ],
                            },
                            {
                                model: Positions,
                                as: "position",
                            },
                        ],
                    },
                ],
            },
        );

        if (!organization) {
            errorMessage = 'Organization not found';
            return res.status(404).json(catchErrorResponse(errorMessage));
        }

        const orgLatestPosts = await Post.findAll({
            where: {
                posted_by_org_id: org_id,
                status: 1,
            },
            include: [
                {
                    model: User,
                    as: "user",
                },
                {
                    model: Organization,
                    as: 'organization'
                },
                {
                    model: PostInfo,
                    as: 'postInfo'
                },
                {
                    model: PostUserTag,
                    as: "postUserTag",
                    include: [
                        {
                            model: User,
                            as: "user",
                            include: [
                                {
                                    model: UserProfile,
                                    as: "userProfile",
                                    attributes: ['profile_id', 'user_id', 'name', 'gender', 'profile_image_url',],
                                },
                            ],
                        },
                    ],
                },
                {
                    model: PostOrgTag,
                    as: "postOrgTag",
                    include: [
                        {
                            model: Organization,
                            as: "organization",
                        },
                    ],
                },
                {
                    model: Status,
                    as: "status",
                },
            ],
            order: [['createdAt', 'DESC']],
            limit: 10,
            offset: 0,
        });

        const data = { organization, orgLatestPosts };
        return res.status(200).json(catchSuccessResponse('Organization details fetched successfully', data));

    } catch (error) {
        errorMessage = error.message;
        console.log(`ERROR: ${req.method} ${req.baseUrl}${req.path} - Error: ${error}`);
        return res.status(500).json(catchErrorResponse(errorMessage));
    }
}



export const renameOrganization = async (req, res) => {
    try {
        const { org_id, updated_name } = req.body;

        const org = await Organization.findByPk(org_id);

        if (!org) {
            errorMessage = 'Organization not found';
            return res.status(404).json(catchErrorResponse(errorMessage));
        }

        const old_name = org.name;
        org.name = updated_name;
        await org.save();

        return res.status(200).json(catchSuccessResponse(`Organization has been renamed from ${old_name} to ${updated_name}`));

    } catch (error) {
        errorMessage = error.message;
        console.log(`ERROR: ${req.method} ${req.baseUrl}${req.path} - Error: ${error}`);
        return res.status(500).json(catchErrorResponse(errorMessage));
    }
}



export const updateOrgCode = async (req, res) => {
    try {
        const { org_id, updated_org_code } = req.body;

        const sameCodeOrg = await Organization.count({
            where: {
                org_code: updated_org_code,
                org_id: {
                    [Op.notIn]: [org_id]
                },
            }
        });

        if (sameCodeOrg > 0) {
            errorMessage = 'New code has already been used by another organization';
            return res.status(400).json(catchErrorResponse(errorMessage));
        }

        const org = await Organization.findByPk(org_id);

        if (!org) {
            errorMessage = 'Organization not found';
            return res.status(404).json(catchErrorResponse(errorMessage));
        }

        const old_org_code = org.name;
        org.org_code = updated_org_code;
        await org.save();

        return res.status(200).json(catchSuccessResponse(`Organization code has been updated from ${old_org_code} to ${updated_org_code}`));

    } catch (error) {
        errorMessage = error.message;
        console.log(`ERROR: ${req.method} ${req.baseUrl}${req.path} - Error: ${error}`);
        return res.status(500).json(catchErrorResponse(errorMessage));
    }
}



export const updateOrgLocation = async (req, res) => {
    try {
        const { org_id, updated_street, updated_city, updated_state, updated_country, updated_pin_code } = req.body;

        const orgLocation = await OrgLocation.findOne({ where: { org_id } });

        if (!orgLocation) {
            errorMessage = 'Organization location not found';
            return res.status(404).json(catchErrorResponse(errorMessage));
        }

        const old_street = orgLocation.street;
        const old_city = orgLocation.city;
        const old_state = orgLocation.state;
        const old_country = orgLocation.country;
        const old_pin_code = orgLocation.pin_code;

        orgLocation.org_street = updated_street;
        orgLocation.org_city = updated_city;
        orgLocation.org_state = updated_state;
        orgLocation.org_country = updated_country;
        orgLocation.org_pin_code = updated_pin_code;

        await orgLocation.save();

        const old_location = `${old_street} ${old_city}, ${old_state}, ${old_country} - ${old_pin_code}`;
        const updated_location = `${updated_street} ${updated_city}, ${updated_state}, ${updated_country} - ${updated_pin_code}`;

        return res.status(200).json(
            catchSuccessResponse(
                `Organization location has been updated from ${old_location} to ${updated_location}`
            )
        );

    } catch (error) {
        errorMessage = error.message;
        console.log(`ERROR: ${req.method} ${req.baseUrl}${req.path} - Error: ${error}`);
        return res.status(500).json(catchErrorResponse(errorMessage));
    }
}



export const orgMembers = async (req, res) => {
    let errorMessage = '';
    try {
        const { org_id, offset, limit } = req.body;

        const orgMembers = await OrgMember.findAll({
            where: { org_id },
            offset,
            limit,
            include: [
                {
                    model: User,
                    as: "user",
                    include: [
                        {
                            model: UserProfile,
                            as: "userProfile",
                            attributes: ['profile_id', 'user_id', 'name', 'gender', 'profile_image_url',],
                        },
                    ],
                },
                {
                    model: Positions,
                    as: "position",
                },
            ],
        });

        const data = { orgMembers }

        return res.status(200).json(catchSuccessResponse(`Organization member's details fetched successfully`, data));

    } catch (error) {
        errorMessage = error.message;
        console.log(`ERROR: ${req.method} ${req.baseUrl}${req.path} - Error: ${error}`);
        return res.status(500).json(catchErrorResponse(errorMessage));
    }
}


export const addPosition = async (req, res) => {
    let errorMessage = '';
    try {
        const { new_position_list } = req.body;

        if (!Array.isArray(new_position_list) || new_position_list.length === 0) {
            errorMessage = 'new_position_list must be a non-empty array';
            return res.status(400).json(catchErrorResponse(errorMessage));
        }

        // Clean and remove duplicates from request
        const positions = [
            ...new Set(
                new_position_list
                    .map(position => position.position?.trim().toLowerCase())
                    .filter(Boolean)
            )
        ];

        // Find positions that already exist in DB
        const existingPositions = await Positions.findAll({
            where: {
                position: positions
            },
            attributes: ['position'],
            raw: true
        });

        const existingPositionNames = new Set(
            existingPositions.map(position => position.position)
        );

        // Keep only new positions
        const positionsToCreate = positions
            .filter(position => !existingPositionNames.has(position));

        if (positionsToCreate.length === 0) {
            errorMessage = 'All member positions already exist';
            return res.status(400).json(catchErrorResponse(errorMessage));
        }

        const newPositions = await Positions.bulkCreate(positionsToCreate.map(position => { return { position } }));

        return res.status(201).json(
            catchSuccessResponse(
                'New member positions have been added successfully',
                newPositions
            )
        );

    } catch (error) {
        errorMessage = error.message;
        console.log(`ERROR: ${req.method} ${req.baseUrl}${req.path} - Error: ${error}`);
        return res.status(500).json(catchErrorResponse(errorMessage));
    }
};
