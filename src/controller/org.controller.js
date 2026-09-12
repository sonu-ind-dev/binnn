import { raw } from "mysql2";
import { Organization, OrgLocation, OrgMember, Positions, Post, UserProfile } from "../db/mysql/index.js";
import { catchErrorResponse, catchSuccessResponse } from "../util/common.js";
import { positions } from "../util/constant.js";
import PostInfoModel from "../db/mongo/post/post_info.model.js";
import { Op } from "sequelize";


export const createOrganization = async (req, res) => {
    let errorMessage = '';
    try {
        const user_id = req.user_id;
        const owner_user_id = user_id;
        const { org_code, name, email, contact_number, street, city, country, pin_code } = req.body;

        const organization = await Organization.create({ org_code, owner_user_id, name, email, contact_number });
        const org_id = organization?.org_id;

        if (!org_id) {
            errorMessage = 'No organization created';
            return res.status(400).json(catchErrorResponse(errorMessage));
        }

        const orgLocation = await OrgLocation.create({ org_id, street, city, country, pin_code });
        const position = await Positions.findOne({
            where: { position: positions['1'] },
            attributes: ['position_id'],
            raw: true
        });
        const orgMember = await OrgMember.create({
            org_id,
            user_id,
            member_position_id: position?.position_id
        });

        if (!orgMember) {
            errorMessage = 'Organization created but failed to provide ownership to user';
            return res.status(400).json(catchErrorResponse(errorMessage));
        }

        const data = { organization, orgLocation, orgMember };
        return res.status(201).json(catchSuccessResponse(`Organization ${organization?.name} created successfully`, data));

    } catch (error) {
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
            attributes: ['org_id', 'member_position_id'],
            raw: true
        });

        if (!orgMember.length) return res.status(200).json(catchSuccessResponse('User is not a part of any organization'));

        const owner_position = await Positions.findOne({
            where: { position: positions['1'] },
            raw: true,
        });

        // REDIS
        const userOwnOrgIds = orgMember
            .filter(member => member.member_position_id === owner_position.position_id)
            .map(member => member.org_id);

        const userOtherOrgIds = orgMember
            .filter(member => member.member_position_id !== owner_position.position_id)
            .map(member => member.org_id);

        const userOwnOrgInfo = await Organization.findAll({
            where: {
                org_id: userOwnOrgIds,
            },
            attributes: ['org_id', 'org_code', 'name'],
        });

        const userOtherOrgInfo = await Organization.findAll({
            where: {
                org_id: userOtherOrgIds,
            },
            attributes: ['org_id', 'org_code', 'name'],
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

        const org = await Organization.findByPk(org_id, { raw: true });

        if (!org) {
            errorMessage = 'Organization not found';
            return res.status(404).json(catchErrorResponse(errorMessage));
        }

        const orgLocation = await OrgLocation.findOne({ where: { org_id }, raw: true });
        const orgMemberCount = await OrgMember.count({ where: { org_id } });
        let orgLatestPosts = await Post.findAll({
            where: { posted_by_org_id: org_id },
            order: [['createdAt', 'DESC']],
            limit: 10,
            offset: 0,
            raw: true,
        });

        const orgLatestPostIds = orgLatestPosts.map(post => post.post_id);

        const latestPostsInfo = await PostInfoModel.findAll({
            where: {
                post_id: { $in: orgLatestPostIds }
            }
        }).lean();

        orgLatestPosts = orgLatestPosts.map(post => {
            const postInfo = latestPostsInfo?.find(info => info.post_id == post.post_id) ?? [];
            post.postInfo = postInfo || null;

            return post;
        });

        if (!orgLocation) {
            errorMessage = 'Organization location not found';
            return res.status(404).json(catchErrorResponse(errorMessage));
        }

        // REDIS
        const data = { organization: org, orgLocation, orgMemberCount, orgLatestPosts };
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
                id: {
                    [Op.ne]: org_id
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
            raw: true,
        });

        const orgMemberUserIds = orgMembers?.map(member => member?.user_id);
        const membersProfileInfo = await UserProfile.findAll({
            where: {
                user_id: {
                    [Op.in]: orgMemberUserIds,
                }
            },
            attributes: ['profile_id', 'user_id', 'name', 'profile_image_url'],
            raw: true,
        });

        const orgMembersInfo = orgMembers.map(member => {
            const memberProfile = membersProfileInfo.filter(userProfile => userProfile.user_id === member.user_id);

            if (memberProfile.length === 0) return null;
            member = { ...member, ...memberProfile[0] };

            return member;
        });

        const positions = await Positions.findAll({ raw: true });

        const data = { orgMembersInfo, positions }

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
