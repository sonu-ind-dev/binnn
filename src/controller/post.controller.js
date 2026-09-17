import { catchErrorResponse, catchSuccessResponse } from "../util/common.js";
import { Organization, Post, PostInfo, PostOrgTag, PostUserTag, Status, User, UserProfile } from "../db/mysql/index.js";
import { Op } from "sequelize";
import PostImagesModel from "../db/mongo/post/post_images.model.js";





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
        const posted_by_org_id = req.headers.org_id ?? null;

        let { tag_user_ids, tag_org_ids, post_info } = req.body;
        tag_user_ids = [...new Set((tag_user_ids ?? []).filter(Boolean))];
        tag_org_ids = [...new Set((tag_org_ids ?? []).filter(Boolean))];

        const { caption, images_urls, latitude, longitude } = post_info ?? {};

        if (!images_urls || images_urls?.length < 1 || !latitude || !longitude) {
            errorMessage = 'Images, latitude & longitude are required.';
            return res.status(400).json(catchErrorResponse(errorMessage));
        }

        const first_image_url = images_urls?.[0];
        const images_count = images_urls?.length;

        // Post Creation
        const post = await Post.create({ posted_by_user_id, posted_by_org_id });

        if (!post) {
            errorMessage = 'No post created';
            return res.status(400).json(catchErrorResponse(errorMessage));
        }
        const post_id = post?.dataValues?.post_id;

        const postInfo = await PostInfo.create({ post_id, caption, first_image_url, images_count, latitude, longitude, status_id: 1, });

        const postImages = await PostImagesModel.create({ post_id, images_urls, });

        // Tag Users
        if (tag_user_ids.length > 0) {
            const users = await User.findAll({
                where: {
                    user_id: {
                        [Op.in]: tag_user_ids,
                        [Op.notIn]: [posted_by_user_id],
                    },
                },
                attributes: ['user_id'],
                raw: true
            });

            if (users.length > 0) {
                const post_tag_users = users.map(user => ({ user_id: user.user_id, post_id }));
                await PostUserTag.bulkCreate(post_tag_users);
            }
        }

        // Tag Orgs
        if (tag_org_ids.length > 0) {
            const orgs = await Organization.findAll({
                attributes: ['org_id'],
                where: {
                    org_id: {
                        [Op.in]: tag_org_ids,
                        [Op.notIn]: posted_by_org_id ? [posted_by_org_id] : [],
                    },
                },
                raw: true
            });

            if (orgs.length > 0) {
                const post_tag_orgs = orgs.map(org => ({ org_id: org.org_id, post_id }));
                await PostOrgTag.bulkCreate(post_tag_orgs);
            }
        }

        const postData = await Post.findByPk(post_id, {
            include: [
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
            ]
        });

        const data = { post: postData, postInfo, postImages };

        return res.status(201).json(catchSuccessResponse(`Post created successfully`, data));

    } catch (error) {
        errorMessage = error.message;
        console.log(`ERROR: ${req.method} ${req.baseUrl}${req.path} - Error: ${error}`);
        return res.status(500).json(catchErrorResponse(errorMessage));
    }
}



// ? PostInfo collection info is not included in response, Handle it.
export const posts = async (req, res) => {
    let errorMessage = '';
    try {
        const { is_feed, latitude, longitude, offset, limit } = req.body;
        const user_id = req.user_id;

        const posts = await Post.findAll({
            where: is_feed ?
                {
                    visible: true,
                } : {
                    posted_by_user_id: user_id,
                    visible: true,
                },
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ['user_id'],
                    include: [
                        {
                            model: UserProfile,
                            as: "userProfile",
                            attributes: ['profile_id', 'user_id', 'name', 'gender', 'profile_image_url',],
                        },
                    ],
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
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        const data = { posts };

        return res.status(200).json(catchSuccessResponse(`Latest post data fetched successfully`, data));

    } catch (error) {
        errorMessage = error.message;
        console.log(`ERROR: ${req.method} ${req.baseUrl}${req.path} - Error: ${error}`);
        return res.status(500).json(catchErrorResponse(errorMessage));
    }
}



export const postTaggedInfo = async (req, res) => {
    let errorMessage = '';
    try {
        const { post_id } = req.body;

        const postTaggedUsers = await PostUserTag.findAll({
            where: { post_id },
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
        });

        const postTaggedOrgs = await PostOrgTag.findAll({
            where: { post_id },
            include: [
                {
                    model: Organization,
                    as: "organization",
                },
            ],
        });

        const data = { postTaggedUsers, postTaggedOrgs };

        return res.status(200).json(catchSuccessResponse(`Post tagged info fetched successfully`, data));

    } catch (error) {
        errorMessage = error.message;
        console.log(`ERROR: ${req.method} ${req.baseUrl}${req.path} - Error: ${error}`);
        return res.status(500).json(catchErrorResponse(errorMessage));
    }
}