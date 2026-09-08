import { OrgMember, Positions } from "../db/mysql/index.js";
import { catchErrorResponse, catchSuccessResponse, catchWarningResponse } from "../util/common.js";





const org_activities_position_ids = {
    // Owner Access
    'make_super_admin': [1],

    // Owner or Super Admin Access
    'make_admin': [1, 2],
    'rename-organization': [1, 2],
    'update-org-code': [1, 2],
    'update-org-location': [1, 2],

    // Owner, Super Admin or Admin Access
    'make_member': [1, 2, 3],
    'approve_post': [1, 2, 3],

    // Owner, Super Admin, Admin or Member Access
    'org-members': [1, 2, 3, 4],

    // Owner, Super Admin, Admin, Member Access or Follower
    'create-post': [1, 2, 3, 4, 5],
}

const check_task_access = (member_position_id, activity) => {
    if (!member_position_id || !activity) return false;

    const member_activity_positions = org_activities_position_ids[activity] ?? [];
    return member_activity_positions.includes(member_position_id);
};

export const memberAccessCheck = (activity = null) => {
    return async (req, res, next) => {

        let errorMessage = '';
        try {
            const user_id = req.user_id ?? '1';
            const org_id = req.body.org_id || req.params.org_id || req.headers.org_id;;

            if (!org_id) next();

            req.org_id = org_id;

            const member_activity_positions = org_activities_position_ids[activity] ?? [];

            if (!member_activity_positions.length) {
                errorMessage = `There is no activity present such as ${activity}`;
                return res.status(400).json(catchErrorResponse(errorMessage));
            }

            if (!user_id || !activity) {
                errorMessage = 'user_id or activity is not present';
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