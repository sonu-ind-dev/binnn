import { Organization, OrgLocation, OrgMember, Positions } from "../db/mysql/index.js";
import { catchErrorResponse, catchSuccessResponse } from "../util/common.js";
import { positions } from "../util/constant.js";


export const createOrganizaton = async (req, res) => {
    let errorMessage = '';
    try {
        const user_id = req.user_id;
        const { org_code, name, email, contact_number, street, city, country, pin_code } = req.body;

        const organizaton = await Organization.create({ org_code, name, email, contact_number });
        const org_id = organizaton?.org_id;

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

        const data = { organizaton, orgLocation, orgMember };
        return res.status(201).json(catchSuccessResponse(`Organization ${organizaton?.name} created successfully`, data));

    } catch (error) {
        errorMessage = error.message;
        console.log(`ERROR: ${req.method} ${req.baseUrl}${req.path} - Error: ${error}`);
        return res.status(500).json(catchErrorResponse(errorMessage));
    }
}



export const allOrganizatons = async (req, res) => {
    let errorMessage = '';
    try {
        const user_id = req.user_id;

        const orgMember = await OrgMember.findAll({
            where: { user_id },
            attributes: ['org_id', 'member_position_id'],
            raw: true
        });

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
