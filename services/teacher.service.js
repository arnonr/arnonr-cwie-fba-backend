const apiToken = "rn7496A7JE7jEnstEbAQDsm2bstbKhaW"; /* HRIS API Access token */
const axios = require("axios").default;
const facultyService = require("../services/faculty.service");
const jwt = require("jsonwebtoken");
const config = require("../configs/app"),
    db = require("../models/Teacher"),
    {
        ErrorBadRequest,
        ErrorNotFound,
        ErrorUnauthorized,
    } = require("../configs/errorMethods"),
    { Op } = require("sequelize");

const methods = {
    scopeSearch(req, limit, offset) {
        // Where
        $where = {};

        if (req.query.teacher_id) $where["teacher_id"] = req.query.teacher_id;

        if (req.query.user_id) $where["user_id"] = req.query.user_id;

        if (req.query.prefix)
            $where["prefix"] = {
                [Op.like]: "%" + req.query.prefix + "%",
            };

        if (req.query.firstname)
            $where["firstname"] = {
                [Op.like]: "%" + req.query.firstname + "%",
            };

        if (req.query.surname)
            $where["surname"] = {
                [Op.like]: "%" + req.query.surname + "%",
            };

        if (req.query.tel)
            $where["tel"] = {
                [Op.like]: "%" + req.query.tel + "%",
            };

        if (req.query.email)
            $where["email"] = {
                [Op.like]: "%" + req.query.email + "%",
            };

        if (req.query.province_id) $where["province_id"] = req.query.province_id;

        if (req.query.amphur_id) $where["amphur_id"] = req.query.amphur_id;

        if (req.query.tumbol_id) $where["tumbol_id"] = req.query.tumbol_id;

        if (req.query.faculty_id) $where["faculty_id"] = req.query.faculty_id;

        if (req.query.department_id) $where["department_id"] = req.query.department_id;

        if (req.query.executive_position)
            $where["executive_position"] = {
                [Op.like]: "%" + req.query.executive_position + "%",
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

        // if (!isNaN(limit)) query["limit"] = limit;

        // if (!isNaN(offset)) query["offset"] = offset;

        query["include"] = [];
        if (req.query.includeAll) {
          query["include"].unshift({ all: true, required: false });
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
                const res = methods.findById(inserted.teacher_id);

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
                await db.update(data, { where: { teacher_id: id } });
                let res = methods.findById(obj.teacher_id);

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
                    where: { teacher_id: id },
                });

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    },

    hrisPersonnelInfo(data) {

        let dataParams = {}
        if (data.person_key)
            dataParams['person_key'] = data.person_key;

        if (data.citizen_id)
            dataParams['citizen_id'] = data.citizen_id;

        dataParams['get_work_info'] = 1;
        dataParams['get_citizen_id'] = 1;
        // dataParams['get_icit_account'] = 1;

        let config = {
        method: "post",
        url: "https://api.hris.kmutnb.ac.th/api/personnel-api/personnel-detail",
        headers: { Authorization: "Bearer " + apiToken },
        data: dataParams,
        // data: { person_key: id, get_work_info : 1 },
        };

        return new Promise(async (resolve, reject) => {
            try {
                const apiObj = await axios(config)
                .then((response) => {
                    return response.data;
                }).catch(error => {
                    if(error.response.status === 404){
                        //reject(ErrorNotFound("ไม่พบข้อมูลบุคลากรในระบบ HRIS"));
                        reject("ไม่พบข้อมูลบุคลากรในระบบ HRIS");
                    }
                    reject(error)
                });

                let apiData = {
                    person_key: apiObj.person_key,
                    citizen_id: apiObj.person_info.citizen_id,
                    person_photo: apiObj.person_photo,
                    last_updated_at: apiObj.last_updated_at,
                    prefix: apiObj.person_info.full_prefix_name_th,
                    firstname: apiObj.person_info.firstname_th,
                    surname: apiObj.person_info.lastname_th,
                    faculty_code: apiObj.work_info.faculty_code,
                    faculty_name: apiObj.work_info.faculty_name_th,
                    department_code: apiObj.work_info.department_code,
                    department_name: apiObj.work_info.department_name_th,
                    position_id: apiObj.work_info.position_id,
                    position_th: apiObj.work_info.position_th,
                    // icit_account: apiObj.icit_account,
                };
                //console.log("service fac = " +apiObj.work_info.faculty_code);
                resolve(apiData);
                // resolve(apiObj);
            } catch (error) {
                reject(error);
            }
        });
    },

    hrisFindPersonnel(data) {

        dataParams = {}
        dataParams['faculty_code'] = 14;

        if (data.firstname)
            dataParams['firstname'] = data.firstname;

        if (data.lastname)
            dataParams['lastname'] = data.surname;

        if (data.position_type_id)
            dataParams['position_type_id'] = data.position_type_id;

        if (data.person_key)
            dataParams['person_key'] = data.person_key;

        let config = {
        method: "post",
        url: "https://api.hris.kmutnb.ac.th/api/personnel-api/list-personnel",
        headers: { Authorization: "Bearer " + apiToken },
        data: dataParams,
        };

        return new Promise(async (resolve, reject) => {
            try {
                const apiObj = await axios(config)
                .then((response) => {
                    // console.log('response.status: ', response.status)
                    return response.data;
                }).catch(error => {
                    // console.log(error.response.status);
                    if(error.response.status === 404){
                        reject(ErrorNotFound("ไม่พบข้อมูลบุคลากรในระบบ HRIS"));
                    }
                    reject(error)
                });
                // .catch((error) => reject(error));

                // if (typeof apiObj.person_key === "undefined") {
                //     reject(ErrorNotFound("ไม่พบข้อมูลบุคลากรจากระบบ HRIS"));
                // }

                let apiData = new Array();
                Object.keys(apiObj.data).forEach(function(key){
                    console.log(key + ' - ' + apiObj.data[key].person_key);
                    apiData.push({
                        person_key: apiObj.data[key].person_key,
                        last_updated_at: apiObj.data[key].last_updated_at,
                        firstname: apiObj.data[key].firstname_th,
                        surname: apiObj.data[key].lastname_th,
                        position_type_id: apiObj.data[key].position_type_id,
                        // faculty_id: '-',
                        // department_id: '-',
                    });
                });
                // resolve(apiObj.data);
                resolve(apiData);
                // resolve(apiObj.data);
            } catch (error) {
                reject(error);
            }
        });
    },

};

module.exports = { ...methods };
