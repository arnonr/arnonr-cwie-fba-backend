const axios = require("axios").default;
const apiToken = "v_6atHl-nF8ZSoN6QQMRPakdbQQIAdQu"; /* ICIT Account Access token */
const config = require("../configs/app"),
    db = require("../models/Student"),
    {
        ErrorBadRequest,
        ErrorNotFound,
        ErrorUnauthorized,
    } = require("../configs/errorMethods"),
    { Op } = require("sequelize");

const facultyService = require("../services/faculty.service"),
    departmentService = require("../services/department.service"),
    majorService = require("../services/major.service");
const Form = require("../models/Form");
const methods = {
    scopeSearch(req, limit, offset) {
        // Where
        $where = {};

        if (req.query.student_id) $where["student_id"] = req.query.student_id;

        if (req.query.student_code)
            $where["student_code"] = {
                [Op.like]: "%" + req.query.student_code + "%",
            };

        if (req.query.prefix)
            $where["prefix"] = {
                [Op.like]: "%" + req.query.prefix + "%",
            };


        if (req.query.faculty_id)
            $where["faculty_id"] = req.query.faculty_id;

        if (req.query.department_id)
            $where["department_id"] = req.query.department_id;

        if (req.query.province_id)
            $where["province_id"] = req.query.province_id;

        if (req.query.amphur_id)
            $where["amphur_id"] = req.query.amphur_id;

        if (req.query.tumbol_id)
            $where["tumbol_id"] = req.query.tumbol_id;

        if (req.query.firstname)
            $where["firstname"] = {
                [Op.like]: "%" + req.query.firstname + "%",
            };

        if (req.query.surname)
            $where["surname"] = {
                [Op.like]: "%" + req.query.surname + "%",
            };

        if (req.query.citizen_id)
            $where["citizen_id"] = {
                [Op.like]: "%" + req.query.citizen_id + "%",
            };

        if (req.query.province_id) $where["province_id"] = req.query.province_id;

        if (req.query.amphur_id) $where["amphur_id"] = req.query.amphur_id;

        if (req.query.tumbol_id) $where["tumbol_id"] = req.query.tumbol_id;

        if (req.query.tel)
            $where["tel"] = {
                [Op.like]: "%" + req.query.tel + "%",
            };

        if (req.query.email)
            $where["email"] = {
                [Op.like]: "%" + req.query.email + "%",
            };

        if (req.query.faculty_id) $where["faculty_id"] = req.query.faculty_id;

        if (req.query.department_id) $where["department_id"] = req.query.department_id;

        if (req.query.major_id) $where["major_id"] = req.query.major_id;

        if (req.query.class_year) $where["class_year"] = req.query.class_year;

        if (req.query.class_room) $where["class_room"] = req.query.class_room;

        if (req.query.advisor_id) $where["advisor_id"] = req.query.advisor_id;

        if (req.query.gpa)
            $where["gpa"] = {
                [Op.like]: "%" + req.query.gpa + "%",
            };

        if (req.query.active) $where["active"] = req.query.active;

        if (req.query.created_by) $where["created_by"] = req.query.created_by;

        if (req.query.updated_at) $where["updated_at"] = req.query.updated_at;

        //
        const query = Object.keys($where).length > 0 ? { where: $where } : {};

        // Order
        $order = [["firstname", "ASC"]];

        if (req.query.orderByField && req.query.orderBy)
            $order = [
                [
                    req.query.orderByField,
                    req.query.orderBy.toLowerCase() == "desc" ? "desc" : "asc",
                ],
            ];
        query["order"] = $order;

        // query["include"] = [{ all: true, required: false }];
        // query["include"] = [
        //     {all: true, required: false},
        //     {model: Form, as: 'forms',include: [{all: true, required: false}]},
        // ];

        // if (!isNaN(limit)) query["limit"] = limit;

        // if (!isNaN(offset)) query["offset"] = offset;

        query["include"] = [];
        if (req.query.includeAll) {
            query["include"].unshift(
                {all: true, required: false},
                {model: Form, as: 'forms',include: [{all: true, required: false}]}
            );
        }

        return { query: query };
    },

    find(req) {
        const limit = +(req.query.size || config.pageLimit);
        const offset = +(limit * ((req.query.page || 1) - 1));
        const _q = methods.scopeSearch(req, limit, offset);
        const _qLimit = {..._q};

        if (!isNaN(limit)) _qLimit.query["limit"] = limit;
        if (!isNaN(offset)) _qLimit.query["offset"] = offset;

        return new Promise(async (resolve, reject) => {
            try {
                Promise.all([
                    db.findAll(_qLimit.query),
                    db.count(_q.query),
                  ])
                  .then((result) => {
                    let rows = result[0];

                    resolve({
                      total: result[1],
                      lastPage: Math.ceil(result[1] / limit),
                      currPage: +req.query.page || 1,
                      rows: rows,
                    });
                  })
                  .catch((error) => {
                    reject(error);
                  });
            } catch (error) {
                reject(error);
            }
        });
    },

    findById(id) {
        return new Promise(async (resolve, reject) => {
            try {

                let obj = await db.findByPk(id, {
                    include: [{ all: true, required: false }],
                });

                if (!obj) reject(ErrorNotFound("id: not found"));

                resolve(obj.toJSON());
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    insert(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const obj = new db(data);
                const inserted = await obj.save();
                const res = methods.findById(inserted.student_id);

                resolve(res);
            } catch (error) {
                reject(ErrorBadRequest(error.message));
            }
        });
    },

    update(id, data) {
        return new Promise(async (resolve, reject) => {
            try {
                // Check ID
                const obj = await db.findByPk(id);
                if (!obj) reject(ErrorNotFound("id: not found"));

                // Update
                // data.document_type_id  = parseInt(id);
                await db.update(data, { where: { student_id: id } });
                let res = methods.findById(obj.student_id);

                resolve(res);
            } catch (error) {
                reject(ErrorBadRequest(error.message));
            }
        });
    },

    delete(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const obj = await db.findByPk(id);
                if (!obj) reject(ErrorNotFound("id: not found"));

                await db.destroy({
                    where: { student_id: id },
                });

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    },

    regStudentInfo(id) {

        let config = {
        method: "post",
        url: "https://api.account.kmutnb.ac.th/api/account-api/student-info",
        headers: { Authorization: "Bearer " + apiToken },
        data: { id: id },
        };

        return new Promise(async (resolve, reject) => {
            try {
                const regObj = await axios(config)
                .then((response) => {
                    return response.data;
                })
                .catch((error) => reject(error));

                if (typeof regObj.STU_CODE === "undefined") {
                    reject(ErrorNotFound("ไม่พบข้อมูลนักศึกษา"));
                }

                let studentData = {
                    student_code: regObj.STU_CODE,
                    prefix_id: regObj.STU_PRE_NAME,
                    firstname: regObj.STU_FIRST_NAME_THAI,
                    surname: regObj.STU_LAST_NAME_THAI,
                    citizen_id: regObj.ID_CARD,
                    faculty_code: regObj.FAC_CODE,
                    faculty_name: regObj.FAC_NAME_THAI,
                    department_code: regObj.DEPT_CODE,
                    department_name: regObj.DEPT_NAME_THAI,
                    division_code: regObj.DIV_CODE,
                    division_name: regObj.DIV_NAME_THAI,
                };

                resolve(studentData);
            } catch (error) {
                reject(error);
            }
        });
    },

    // insertRegStudent(id) {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             const studentObj = await methods.regStudentInfo(id);

    //             const obj = await db.findOne({
    //                 where: { student_code : studentObj.student_code },
    //             });

    //             let saveObj = null;
    //             if (!obj) {
    //                 saveObj = methods.insert(studentObj);
    //             }else{
    //                 saveObj = methods.update(obj.student_id, studentObj);
    //             }

    //             resolve(saveObj);
    //         } catch (error) {
    //             reject(ErrorBadRequest(error.message));
    //         }
    //     });
    // },

    importRegStudent(id){
        return new Promise(async (resolve, reject) => {
            try {
                const studentObj = await db.findOne({
                    where: { student_code : id },
                });

                let saveObj = null;

                if (!studentObj) {
                    let result = await methods.regStudentInfo(id);

                    /* get faculty and create if not exists */
                     const faculty = await facultyService.importFaculty({faculty_code:result.faculty_code, faculty_name:result.faculty_name});
                     let faculty_id = faculty.faculty_id;

                         /* get department and create if not exists */
                     // const department = await departmentService.importDepartment({department_code:result.department_code, department_name:result.department_name, faculty_id:faculty_id, user_id:user_id});
                     // let department_id = department.department_id;

                     /* get major and create if not exists */
                     // const major = await majorService.importMajor({major_code:result.division_code, major_name:result.division_name, department_id:department_id, user_id:user_id});
                     // let major_id = major.major_id;

                     result['faculty_id'] = faculty_id;
                     // result['department_id'] = department_id;
                     // result['major_id'] = major_id;

                     if (!studentObj) {
                        saveObj = await methods.insert(result);
                        console.log("Insert student");
                    }else{
                        // saveObj = await methods.update(studentObj.student_id, result);
                        console.log("Update student");
                    }
                }else{
                    console.log("Student already exists");
                }
                resolve(saveObj);
            } catch (error) {
                reject(error);
            }
        });
    }

};

module.exports = { ...methods };
