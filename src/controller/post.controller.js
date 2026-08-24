import { catchErrorResponse, catchSuccessResponse } from "../util/common.js";
import { Organization, Post, PostOrgTag, PostUserTag, User } from "../db/mysql/index.js";
import PostInfoModel from "../db/mongo/post/post_info.model.js";





/**
 * & Explaination:
 * ? Fetch required info from req & handle validation
 * ? Handle if user already exist in user table
 * ? Handle if user already exist in registeration table then fetch and update otherwise create
 * ? Handle if user is trying multiple times or blocked or un-blocked
 * ? Generate password hash, otp hash and otp_expiry then update or create and send data
 * & Required Updates (if any):
 * ? Send otp on shared mobile number with password info also
 * ? If any uer got blocked due to multiple submissions then will send notification after block time
*/


/**
 * @route POST /api/post/create-post
 * @param {String} posted_by_org_id To include on org page if posting for org
 * @description To create post for individual user or it's org
 */
export const createPost = async (req, res) => {
    let errorMessage = '';
    try {
        const posted_by_user_id = req.user_id;
        const posted_by_org_id = req.headers.org_id;

        let { tag_user_ids, tag_org_ids, post_info } = req.body;
        tag_user_ids = [...new Set(tag_user_ids)];
        tag_org_ids = [...new Set(tag_org_ids)];

        const { caption, image_urls, latitude, longitude } = post_info ?? {};

        if (!posted_by_user_id) {
            errorMessage = 'Failed to fetch user_id from request';
            return res.status(400).json(catchErrorResponse(errorMessage));
        }

        // Post Creation
        const post = await Post.create({ posted_by_user_id, posted_by_org_id: posted_by_org_id });
        const post_id = post.post_id;

        if (!post_id) {
            errorMessage = 'No post created';
            return res.status(400).json(catchErrorResponse(errorMessage));
        }

        const postInfo = await PostInfoModel.create({
            post_id,
            caption,
            image_urls,
            latitude,
            longitude,
            status_id: 0,
        });

        // Tag Users
        let postUsersTag = null, postOrgsTag = null;

        if (tag_user_ids.length) {
            const users = await User.findAll({
                attributes: ['user_id'],
                where: {
                    user_id: tag_user_ids
                },
                raw: true
            });
            const post_tag_users = users.map(user => ({ user_id: user.user_id, post_id }));

            if (post_tag_users.length) {
                postUsersTag = await PostUserTag.bulkCreate(post_tag_users);
            }
        }

        // Tag Orgs
        if (tag_org_ids.length) {
            const orgs = await Organization.findAll({
                attributes: ['org_id'],
                where: {
                    org_id: tag_org_ids
                },
                raw: true
            });
            const post_tag_orgs = orgs.map(org => ({ org_id: org.org_id, post_id }));

            if (post_tag_orgs.length) {
                postOrgsTag = await PostOrgTag.bulkCreate(post_tag_orgs);
            }
        }

        const data = { post, postInfo, postUsersTag, postOrgsTag }
        return res.status(201).json(catchSuccessResponse(`Post created successfully`, data));

    } catch (error) {
        errorMessage = error.message;
        console.log(`ERROR: ${req.method} ${req.baseUrl}${req.path} - Error: ${error}`);
        return res.status(500).json(catchErrorResponse(errorMessage));
    }
}
