import config from "../config/config.js";
import { Positions } from "../db/mysql/index.js";
import { catchErrorResponse, catchSuccessResponse } from "../util/common.js";

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
