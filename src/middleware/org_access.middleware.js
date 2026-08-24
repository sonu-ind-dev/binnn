import { OrgMember, Positions } from "../db/mysql/index.js";
import { catchErrorResponse, catchSuccessResponse, catchWarningResponse } from "../util/common.js";




export const org_tasks = {
    'make_super_admin': 'make_super_admin',
    'make_admin': 'make_admin',
    'make_member': 'make_member',

    'create-post': 'create-post',
    'approve_post': 'approve_post',
};

const check_task_access = (member_position_id, access_type) => {
    if (!member_position_id || !access_type) return false;

    switch (access_type) {
        // Org Member Type Changes Access
        case 'make_super_admin':
            return [1].includes(member_position_id);
            break;
        case 'make_admin':
            return [1, 2].includes(member_position_id);
            break;
        case 'make_member':
            return [1, 2, 3].includes(member_position_id);
            break;


        // Org Post Related Access
        case 'create-post':
            return [1, 2, 3, 4].includes(member_position_id);
            break;
        case 'approve_post':
            return [1, 2, 3].includes(member_position_id);
            break;
        default:
            return false;
    }
};

export const memberAccessCheck = (access_type = null) => {
    return async (req, res, next) => {

        let errorMessage = '';
        try {
            const user_id = req.user_id;
            const org_id = req.org_id || req.body.org_id || req.params.org_id;

            if (!org_id) next();

            if (!user_id || !access_type) {
                errorMessage = 'user_id or access_type is not present';
                return res.status(400).json(catchErrorResponse(errorMessage));
            }

            const orgMember = await OrgMember.findOne({
                where: {
                    org_id,
                    user_id,
                },
                attributes: ['member_position_id'],
                raw: true,
            });

            if (!orgMember) {
                errorMessage = 'User is not a member or follower of this organization';
                return res.status(403).json(catchWarningResponse(errorMessage));
            }

            const memberPosition = await Positions.findByPk(
                orgMember?.member_position_id,
                {
                    attributes: ['position_id'],
                    raw: true
                }
            );

            if (!memberPosition) {
                errorMessage = 'Member do not have any access to perform any task for this organization';
                return res.status(403).json(catchWarningResponse(errorMessage));
            }

            const haveAccess = check_task_access(memberPosition.position_id, access_type);

            // return res.status(200).json(catchSuccessResponse(`User have access to perform task: ${access_type}`));
            if (haveAccess) next();

            errorMessage = `User do not have any access to perform task: ${access_type}`;
            return res.status(403).json(catchWarningResponse(errorMessage));

        } catch (error) {
            errorMessage = error.message;
            console.log(`ERROR: ${req.method} ${req.baseUrl}${req.path} - Error: ${error}`);
            return res.status(500).json(catchErrorResponse(errorMessage));
        }
    }
}