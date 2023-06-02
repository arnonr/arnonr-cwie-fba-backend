const { Model, DataTypes } = require("sequelize"),
    { sequelize } = require("../configs/databases");

class Company extends Model {
    // Custom JSON Response
    //   toJSON() {
    //     return {
    //       ...this.get(),
    //     };
    //   }
}

Company.init(
    {
        company_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            comment: "รหัสสถานประกอบการ",
        },
        name_th: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: "ชื่อสถานประกอบการ (ไทย)",
        },
        name_en: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: "ชื่อสถานประกอบการ (อังกฤษ)",
        },
        tel: {
            type: DataTypes.STRING(32),
            allowNull: true,
            comment: "เบอร์โทรศัพท์",
        },
        fax: {
            type: DataTypes.STRING(32),
            allowNull: true,
            comment: "โทรสาร",
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: "อีเมล",
        },
        website: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: "เว็บไซต์",
        },
        blacklist: {
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 0,
            comment: "ขึ้นบัญชีดำ (1 = ใช่ / 0 = ไม่ใช่)",
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: "หมายเหตุ",
        },
        namecard_file: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: "ไฟล์นามบัตร",
        },
        map_file: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: "ไฟล์แผนที่",
        },
        address: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: "อีเมล",
        },
        province_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "อิงจังหวัด",
        },
        amphur_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "อิงอำเภอ",
        },
        tumbol_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "อิงตำบล",
        },
        active: {
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 1,
            comment: "1 = เปิดการใช้งาน / 0 = ปิดการใช้งาน",
        },
        createdAt: {
            field: "created_at",
            type: DataTypes.DATE,
            allowNull: false,
            comment: "วันที่เพิ่มข้อมูล",
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "ผู้เพิ่มข้อมูล",
        },
        updatedAt: {
            field: "updated_at",
            type: DataTypes.DATE,
            allowNull: true,
            comment: "วันที่แก้ไขข้อมูลล่าสุด",
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "ผู้แก้ไขข้อมูลล่าสุด",
        },
        deletedAt: {
            field: "deleted_at",
            type: DataTypes.DATE,
            allowNull: true,
            comment: "วันที่ลบข้อมูล",
        },
    },
    {
        sequelize,
        timestamps: true,
        freezeTableName: true,
        paranoid: true,
        modelName: "company" /* ชื่อตาราง */,
    }
);

const Province = require("./Province");
const Amphur = require("./Amphur");
const Tumbol = require("./Tumbol");

Company.belongsTo(Province, { foreignKey: "province_id" });
Company.belongsTo(Amphur, { foreignKey: "amphur_id" });
Company.belongsTo(Tumbol, { foreignKey: "tumbol_id" });

module.exports = Company;