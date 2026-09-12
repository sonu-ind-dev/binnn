import { DataTypes, Model, QueryTypes } from "sequelize";
import { sequelize } from "../../config/database.js";
import config from "../../config/config.js";

// User Tables
import { initializeUserRegisterModel, userRegisterVersionInfo } from "./user/user_register.model.js";
import { initializeUserModel, userVersionInfo } from "./user/user.model.js";
import { initializeUserProfileModel, userProfileVersionInfo } from "./user/user_profile.model.js";

// Post Tables
import { initializePostModel, postVersionInfo } from "./post/post.model.js";
import { initializePostUserTagModel, postUserTagVersionInfo } from "./post/post_user_tag.model.js";
import { initializePostOrgTagModel, postOrgTagVersionInfo } from "./post/post_org_tag.model.js";
import { initializeStatusModel, statusVersionInfo } from "./post/status.model.js";

// Organization Tables
import { initializeOrganizationModel, organizationVersionInfo } from "./organization/organization.model.js";
import { initializeOrgLocationModel, orgLocationVersionInfo } from "./organization/org_location.model.js";
import { initializePositionsModel, positionsVersionInfo } from "./organization/positions.model.js";
import { initializeOrgMemberModel, orgMemberVersionInfo } from "./organization/org_member.model.js";


/**
 * & How to update a table
 * ? Step 01: Do the table related code changes
 * ? Step 02: In table model file update it's version info object details properly
 * ? Step 03: Change databaseTableUpdateFlag to true and tablesUpdateFlags of that particular table to true in /src/db/mysql/index.js file
 * ? Step 04: Change databaseTableUpdateFlag to false and tablesUpdateFlags of that particular table to false in /src/db/mysql/index.js file
 * & That's it your table related changes are completed.
 */
const tablesUpdateFlags = Object.freeze({
    // & User Models
    user_register: false,
    user: false,
    user_profile: false,

    // & User Models
    post: false,
    post_user_tag: false,
    post_org_tag: false,
    status: false,

    // & Organization Models
    organization: false,
    org_location: false,
    positions: false,
    org_member: false,
});
const databaseUpdateFlag = false;
const databaseTableUpdateFlag = false;

// Remove file from tracking: git rm --cached src/db/mysql/index.js
// Get this file back to tracking: git add src/db/mysql/index.js
// Fetch list of all ignored files: git ls-files --others --exclude-standard

// & Export Our User Models
export const UserRegister = initializeUserRegisterModel(sequelize);
export const User = initializeUserModel(sequelize);
export const UserProfile = initializeUserProfileModel(sequelize);

// & Export Our Post Models
export const Post = initializePostModel(sequelize);
export const PostUserTag = initializePostUserTagModel(sequelize);
export const PostOrgTag = initializePostOrgTagModel(sequelize);
export const Status = initializeStatusModel(sequelize);

// & Export Our Organization Models
export const Organization = initializeOrganizationModel(sequelize);
export const OrgLocation = initializeOrgLocationModel(sequelize);
export const OrgMember = initializeOrgMemberModel(sequelize);
export const Positions = initializePositionsModel(sequelize);


const tableRegistry = [
    // & User Models
    {
        tableName: "user_register",
        model: UserRegister,
        versionInfo: { ...userRegisterVersionInfo, approved_by: userRegisterVersionInfo.approved_by.trim().length ? userRegisterVersionInfo.approved_by : config.MYSQL_TABLE_VERSION_APPROVED_BY },
    },
    {
        tableName: "user",
        model: User,
        versionInfo: { ...userVersionInfo, approved_by: userVersionInfo.approved_by.trim().length ? userVersionInfo.approved_by : config.MYSQL_TABLE_VERSION_APPROVED_BY },
    },
    {
        tableName: "user_profile",
        model: UserProfile,
        versionInfo: { ...userProfileVersionInfo, approved_by: userProfileVersionInfo.approved_by.trim().length ? userProfileVersionInfo.approved_by : config.MYSQL_TABLE_VERSION_APPROVED_BY },
    },

    // & Post Models
    {
        tableName: "post",
        model: Post,
        versionInfo: { ...postVersionInfo, approved_by: postVersionInfo.approved_by.trim().length ? postVersionInfo.approved_by : config.MYSQL_TABLE_VERSION_APPROVED_BY },
    },
    {
        tableName: "post_user_tag",
        model: PostUserTag,
        versionInfo: { ...postUserTagVersionInfo, approved_by: postUserTagVersionInfo.approved_by.trim().length ? postUserTagVersionInfo.approved_by : config.MYSQL_TABLE_VERSION_APPROVED_BY },
    },
    {
        tableName: "post_org_tag",
        model: PostOrgTag,
        versionInfo: { ...postOrgTagVersionInfo, approved_by: postOrgTagVersionInfo.approved_by.trim().length ? postOrgTagVersionInfo.approved_by : config.MYSQL_TABLE_VERSION_APPROVED_BY },
    },
    {
        tableName: "status",
        model: Status,
        versionInfo: { ...statusVersionInfo, approved_by: statusVersionInfo.approved_by.trim().length ? statusVersionInfo.approved_by : config.MYSQL_TABLE_VERSION_APPROVED_BY },
    },

    // & Organization Models
    {
        tableName: "organization",
        model: Organization,
        versionInfo: { ...organizationVersionInfo, approved_by: organizationVersionInfo.approved_by.trim().length ? organizationVersionInfo.approved_by : config.MYSQL_TABLE_VERSION_APPROVED_BY },
    },
    {
        tableName: "org_location",
        model: OrgLocation,
        versionInfo: { ...orgLocationVersionInfo, approved_by: orgLocationVersionInfo.approved_by.trim().length ? orgLocationVersionInfo.approved_by : config.MYSQL_TABLE_VERSION_APPROVED_BY },
    },
    {
        tableName: "positions",
        model: Positions,
        versionInfo: { ...positionsVersionInfo, approved_by: positionsVersionInfo.approved_by.trim().length ? positionsVersionInfo.approved_by : config.MYSQL_TABLE_VERSION_APPROVED_BY },
    },
    {
        tableName: "org_member",
        model: OrgMember,
        versionInfo: { ...orgMemberVersionInfo, approved_by: orgMemberVersionInfo.approved_by.trim().length ? orgMemberVersionInfo.approved_by : config.MYSQL_TABLE_VERSION_APPROVED_BY },
    },
];


// & Foreign Key Relations
// ! user_id Foreign Key
// ? USER ? User & UserProfile user_id relation
User.hasOne(UserProfile, { foreignKey: "user_id", sourceKey: "user_id", as: "profile" });
UserProfile.belongsTo(User, { foreignKey: "user_id", targetKey: "user_id", as: "user" });

// ? POST ? User & Post - One to many relation
User.hasMany(Post, { foreignKey: "posted_by_user_id", sourceKey: "user_id", as: "post" });
Post.belongsTo(User, { foreignKey: "posted_by_user_id", targetKey: "user_id", as: "user" });

// ? POST ? User & PostUserTag - One to many relation
User.hasMany(PostUserTag, { foreignKey: "user_id", sourceKey: "user_id", as: "postUserTag" });
PostUserTag.belongsTo(User, { foreignKey: "user_id", targetKey: "user_id", as: "user" });

// ? POST ? User & PostOrgTag - One to many relation
User.hasMany(PostOrgTag, { foreignKey: "approved_by", sourceKey: "user_id", as: "postOrgTag" });
PostOrgTag.belongsTo(User, { foreignKey: "approved_by", targetKey: "user_id", as: "user" });

// ? ORGANIZATION ? User & Organization - One to many relation
User.hasMany(Organization, { foreignKey: "owner_user_id", sourceKey: "user_id", as: "organization" });
Organization.belongsTo(User, { foreignKey: "owner_user_id", targetKey: "user_id", as: "user" });

// ? ORGANIZATION ? User & OrgMember - One to many relation
User.hasMany(OrgMember, { foreignKey: "user_id", sourceKey: "user_id", as: "orgMember" });
OrgMember.belongsTo(User, { foreignKey: "user_id", targetKey: "user_id", as: "user" });

// ! post_id Foreign Key
// ? POST ? Post & PostUserTag - One to many relation
Post.hasMany(PostUserTag, { foreignKey: "post_id", sourceKey: "post_id", as: "postUserTag" });
PostUserTag.belongsTo(Post, { foreignKey: "post_id", targetKey: "post_id", as: "Post" });

// ? POST ? Post & PostOrgTag - One to many relation
Post.hasMany(PostOrgTag, { foreignKey: "post_id", sourceKey: "post_id", as: "postOrgTag" });
PostOrgTag.belongsTo(Post, { foreignKey: "post_id", targetKey: "post_id", as: "Post" });

// ! org_id Foreign Key
// ? POST ? Organization & Post - One to many relation
Organization.hasMany(Post, { foreignKey: "posted_by_org_id", sourceKey: "org_id", as: "post" });
Post.belongsTo(Organization, { foreignKey: "posted_by_org_id", targetKey: "org_id", as: "organization" });

// ? POST ? Organization & PostOrgTag - One to many relation
Organization.hasMany(PostOrgTag, { foreignKey: "org_id", sourceKey: "org_id", as: "postOrgTag" });
PostOrgTag.belongsTo(Organization, { foreignKey: "org_id", targetKey: "org_id", as: "organization" });

// ? Organization ? Organization & OrgLocation - One to one relation
Organization.hasOne(OrgLocation, { foreignKey: "org_id", sourceKey: "org_id", as: "orgLocation" });
OrgLocation.belongsTo(Organization, { foreignKey: "org_id", targetKey: "org_id", as: "organization" });

// ? Organization ? Organization & OrgMember - One to many relation
Organization.hasMany(OrgMember, { foreignKey: "org_id", sourceKey: "org_id", as: "orgMember" });
OrgMember.belongsTo(Organization, { foreignKey: "org_id", targetKey: "org_id", as: "organization" });

// ? Positions ? Positions & OrgMember - One to many relation
Positions.hasMany(OrgMember, { foreignKey: "member_position_id", sourceKey: "position_id", as: "orgMember" });
OrgMember.belongsTo(Positions, { foreignKey: "member_position_id", targetKey: "position_id", as: "position" })




export class TableVersionHistory extends Model { }

TableVersionHistory.init(
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        table_name: {
            type: DataTypes.STRING(64),
            allowNull: false,
        },
        version: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        updated_by: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        approved_by: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "TableVersionHistory",
        tableName: "table_version_history",
        createdAt: "applied_at",
        updatedAt: false,
        indexes: [
            {
                name: "uq_table_version_history_table_version",
                unique: true,
                fields: ["table_name", "version"],
            },
        ],
    },
);


function validateVersionInfo(tableName, versionInfo) {
    const requiredFields = ["version", "description", "updated_by", "approved_by"];

    for (const field of requiredFields) {
        if (typeof versionInfo?.[field] !== "string" || !versionInfo[field].trim()) {
            throw new Error(`Missing ${field} in version information for ${tableName}.`);
        }
    }
}

async function syncEnabledTableUpdates() {
    for (const table of tableRegistry) {
        if (tablesUpdateFlags[table.tableName] !== true) {
            continue;
        }

        table.versionInfo.approved_by = table.versionInfo.approved_by.trim().length ? table.versionInfo.approved_by : config.MYSQL_TABLE_VERSION_APPROVED_BY;

        validateVersionInfo(table.tableName, table.versionInfo);

        const existingVersion = await TableVersionHistory.findOne({
            where: {
                table_name: table.tableName,
                version: table.versionInfo.version,
            },
        });

        if (existingVersion) {
            console.log(
                `ERROR: Table ${table.tableName} model not updated. Table: ${table.tableName} Version: ${table.versionInfo.version} already exists.`
            );
            throw new Error(
                `WARNING: For Table: ${table.tableName} use a New Version or set its tableUpdateFlag to false.`
            );
        }

        // alter: true compares the model with MySQL and applies ALTER TABLE
        // statements for the detected schema differences.
        await table.model.sync({ alter: true });

        await TableVersionHistory.create({
            table_name: table.tableName,
            ...table.versionInfo,
        });

        console.log(
            `SUCCESS: Synchronized Table: ${table.tableName} @Version: ${table.versionInfo.version}`,
        );
    }
}


/** Run before the HTTP server accepts requests. */
export const initializeMysqlModels = async () => {
    const lockName = "bin_mysql_schema_initialization";
    const [lock] = await sequelize.query(
        "SELECT GET_LOCK(:lockName, 30) AS acquired",
        { replacements: { lockName }, type: QueryTypes.SELECT },
    );

    if (Number(lock.acquired) !== 1) {
        throw new Error("Could not acquire the MySQL schema initialization lock.");
    }

    try {
        // Without alter/force, this creates only missing registered tables.
        if (databaseUpdateFlag) await sequelize.sync();
        if (databaseTableUpdateFlag) await syncEnabledTableUpdates();
    } finally {
        await sequelize.query("SELECT RELEASE_LOCK(:lockName)", {
            replacements: { lockName },
            type: QueryTypes.SELECT,
        });
    }
}
