let apiToken = "v_6atHl-nF8ZSoN6QQMRPakdbQQIAdQu"; /* ICIT Account API access token */

const config = require("../configs/app"),
  db = require("../models/User"),
  dbTeacher = require("../models/Teacher"),
  jwt = require("jsonwebtoken"),
  {
    ErrorBadRequest,
    ErrorNotFound,
    ErrorUnauthorized,
  } = require("../configs/errorMethods"),
  { Op } = require("sequelize");

const nodemailer = require("nodemailer");
const axios = require("axios").default;
const studentService = require("../services/student.service");
const methods = {
  scopeSearch(req, limit, offset) {
    // Where
    $where = {};

    if (req.query.user_id) $where["user_id"] = req.query.user_id;

    if (req.query.username)
      $where["username"] = {
        [Op.like]: "%" + req.query.username + "%",
      };

    if (req.query.name)
      $where["name"] = {
        [Op.like]: "%" + req.query.name + "%",
      };

    if (req.query.tel)
      $where["tel"] = {
        [Op.like]: "%" + req.query.tel + "%",
      };

    if (req.query.email)
      $where["email"] = {
        [Op.like]: "%" + req.query.email + "%",
      };

    if (req.query.citizen_id)
      $where["citizen_id"] = {
        [Op.like]: "%" + req.query.citizen_id + "%",
      };

    if (req.query.account_type) $where["account_type"] = req.query.account_type;

    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["username", "ASC"]];
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
        resolve(obj); /* ทดสอบการปรับปรุงข้อมูลจาก ICIT account */
        // resolve(obj.toJSON());
      } catch (error) {
        reject(ErrorNotFound("id: not found"));
      }
    });
  },

  insert(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = new db(data);
        // obj.Password = obj.passwordHash(obj.Password);
        // obj.Password = obj.passwordHash("12345678!");
        const inserted = await obj.save();

        // let transporter = nodemailer.createTransport({
        //   host: "smtp.gmail.com",
        //   port: 587,
        //   secure: false,
        //   auth: {
        //     // ข้อมูลการเข้าสู่ระบบ
        //     user: "edocument@fba.kmutnb.ac.th", // email user ของเรา
        //     pass: "edoc2565", // email password
        //   },
        // });

        // let info = await transporter.sendMail({
        //   from: '"ระบบฐานข้อมูลโคเนื้อ กระบือ แพะ', // อีเมลผู้ส่ง
        //   to: obj.Username, // อีเมลผู้รับ สามารถกำหนดได้มากกว่า 1 อีเมล โดยขั้นด้วย ,(Comma)
        //   subject: "ระบบฐานข้อมูล โคเนื้อ กระบิอ แพะ", // หัวข้ออีเมล
        //   // text: "d", // plain text body
        //   html: "<b>คุณได้รับการอนุมัติการเข้าใช้งานระบบฐานข้อมูล โคเนื้อ กระบือ แพะ สามารถเข้าใช้งานได้ที่ <a href='http://178.128.216.177/'>คลิก</a></b>", // html body
        // });

        let res = methods.findById(inserted.user_id);

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
        // data.user_id = parseInt(id);

        // if (data.Password) {
        //   data.Password = obj.passwordHash(data.Password);
        // }

        await db.update(data, { where: { user_id: id } });

        let res = methods.findById(obj.user_id);

        resolve(res);
      } catch (error) {
        reject(ErrorBadRequest(error.message));
      }
    });
  },

  // delete(id) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       const obj = await db.findByPk(id);
  //       if (!obj) reject(ErrorNotFound("id: not found"));

  //       await db.update(
  //         { isRemove: 1, isActive: 0 },
  //         { where: { user_id: id } }
  //       );

  //       const obj1 = UserToAnimalType.destroy({
  //         where: { user_id: id },
  //         // // truncate: true,
  //       });

  //       resolve();
  //     } catch (error) {
  //       reject(error);
  //     }
  //   });
  // },

  loginIcitAccount(data) {
    let scopes = "personel,student,alumni";
    let config = {
      method: "post",
      url: "https://api.account.kmutnb.ac.th/api/account-api/user-authen",
      headers: { Authorization: "Bearer " + apiToken },
      data: {
        scopes: scopes,
        username: data.username,
        password: data.password,
      },
    };

    return new Promise(async (resolve, reject) => {

      try {
        const loginObj = await axios(config)
          .then((response) => {
            return response.data;
          })
          .catch((error) => error);

        if (typeof loginObj.userInfo !== "undefined") {

          let teacherObj = null;

          const account_type = loginObj.userInfo.account_type;
          const username = loginObj.userInfo.username;
          const citizen_id = loginObj.userInfo.pid;
          let create_account_type = 0;

          if (account_type == "alumni" || account_type == "student") {
            /* ตรวจสอบคณะจากรหัสนักศึกษา  */
            if (username.substring(3, 5) != "14"){
              // reject(
              //   ErrorUnauthorized(
              //     "ใช้งานได้เฉพาะนักศึกษาคณะบริหารธุรกิจเท่านั้น"
              //   )
              // );
            }

            /* เพิ่มข้อมูลนักศึกษาเข้าตาราง Student */
            let student_code = username.substring(1);
            // console.log("Student",student_code);
            await studentService.importRegStudent(student_code);
          }

          let userObj = await db.findOne({
            where: { username: loginObj.userInfo.username },
          });

          // let userObj = await methods.findById(5);

          if (!userObj) {
            /* ไม่มีข้อมูลใน user db จะต้องตรวจสอบว่าเป็นนักศึกษา หรืออาจารย์ */
            let create_account = false;
            if (account_type == "alumni" || account_type == "student") {
              /**
               * find from student db
               * ถ้าเป็นนักศึกษา ให้เพิ่มข้อมูล user
               */
              create_account = true;
              create_account_type = 1; //Student
            } else {
              /**
               * find from teacher db
               * ให้ตรวจสอบว่ามีข้อมูลอาจารย์หรือไม่ ถ้ามีให้เพิ่มข้อมูล user
               * ถ้าไม่มีให้ปฏิเสธการเข้าใช้งาน
               *
               * ถ้าเข้าใช้งานครั้งแรก จะหาข้อมูลอาจารย์ยังไง
               * */

              teacherObj = await dbTeacher.findOne({
                where: { citizen_id: citizen_id },
              });

              if (!teacherObj) {
                reject(ErrorUnauthorized("ไม่มีสิทธิ์เข้าใช้งาน กรุณาติดต่องานสหกิจศึกษา คณะบริหารธุรกิจ"));
              }else{
                // พบข้อมูลในตาราง Teacher เป็นอาจารย์
                create_account = true;
                create_account_type = 2; //Teacher
              }
            }

            if (create_account == true) {
              let insertData = {
                username: loginObj.userInfo.username,
                name: loginObj.userInfo.displayname,
                email: loginObj.userInfo.email,
                citizen_id: loginObj.userInfo.pid,
                // account_type:loginObj.userInfo.account_type == "personel" ? 2 : 1,
                account_type:create_account_type
              };
              userObj = await methods.insert(insertData);

              /* มีข้อมูลอาจารย์ในตาราง Teacher และยังไม่มี user_id */
              if(teacherObj && teacherObj.user_id === null){
                /* ยังไม่มี user_id */
                  await dbTeacher.update({user_id:userObj.user_id}, { where: { teacher_id: teacherObj.teacher_id } });
              }

            }

          }else{ /* มีข้อมูลในตาราง User แล้ว (เจ้าหน้าที่คณะ) หรือ อาจารย์ */
              let updateData = {
                name: loginObj.userInfo.displayname,
                citizen_id: loginObj.userInfo.pid,
              };

              userObj = await methods.findById(userObj.user_id);
          }

          resolve({
            accessToken: userObj.generateJWT(userObj),
            userData: userObj,
            accountData: loginObj,
          });

        } else if (loginObj.api_status_code == "416") {
          reject(ErrorUnauthorized(loginObj.api_message));
        } else if (loginObj.api_status_code == "405") {
          reject(ErrorUnauthorized("Username or Password invalid"));
        } else if (loginObj.api_status == "fail") {
          reject(ErrorUnauthorized(loginObj.api_message));
        } else {
          resolve(loginObj);
        }
      } catch (error) {
        reject(ErrorBadRequest(error.message));
      }
    });
  },

  login(data, ip, device) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await db.findOne({
          where: { username: data.username },
          include: { all: true },
        });

        // checkICIT ACCOUNT
        //
        //return new Promise((resolve, reject) => { axios.post("/api/position", form_data).then((response) => { return resolve(response); }).catch((error) => reject(error)); });

        // ตรวจสอบว่ามี username
        if (!obj) {
          reject(ErrorUnauthorized("Username not found"));
        } else {
          // ตรวจสอบ Password
          if (!obj.validPassword(data.password)) {
            reject(ErrorUnauthorized("Password is invalid."));
          }
        }

        res = {
          ...obj.toJSON(),
        };

        resolve({ accessToken: obj.generateJWT(obj), userData: res });
      } catch (error) {
        reject(error);
      }
    });
  },

  // register(data) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       const obj = new db(data);
  //       obj.Password = obj.passwordHash(obj.Password);
  //       const inserted = await obj.save();

  //       // Send mail
  //       let transporter = nodemailer.createTransport({
  //         host: "smtp.gmail.com",
  //         port: 587,
  //         secure: false,
  //         auth: {
  //           // ข้อมูลการเข้าสู่ระบบ
  //           user: "edocument@fba.kmutnb.ac.th", // email user ของเรา
  //           pass: "edoc2565", // email password
  //         },
  //       });

  //       let info = await transporter.sendMail({
  //         from: '"ระบบฐานข้อมูลโคเนื้อ กระบือ แพะ', // อีเมลผู้ส่ง
  //         to: inserted.Username, // อีเมลผู้รับ สามารถกำหนดได้มากกว่า 1 อีเมล โดยขั้นด้วย ,(Comma)
  //         subject: "ระบบฐานข้อมูล โคเนื้อ กระบือ แพะ", // หัวข้ออีเมล
  //         // text: "d", // plain text body
  //         html: "<b>ระบบฐานข้อมูล โคเนื้อ กระบิอ แพะ ได้รับข้อมูลของท่านเรียบร้อยแล้ว อยู่ระหว่างรอการอนุมัติ", // html body
  //       });

  //       let res = methods.findById(inserted.user_id);

  //       resolve(res);
  //     } catch (error) {
  //       reject(ErrorBadRequest(error.message));
  //     }
  //   });
  // },

  refreshToken(accessToken) {
    return new Promise(async (resolve, reject) => {
      try {
        const decoded = jwt.decode(accessToken);
        const obj = await db.findOne({
          where: { username: decoded.username },
          include: [{ all: true, nested: true }],
        });

        if (!obj) {
          reject(ErrorUnauthorized("Username not found"));
        }
        resolve({ accessToken: obj.generateJWT(obj), userData: obj });
      } catch (error) {
        reject(error);
      }
    });
  },

  verifyToken(accessToken) {
    return new Promise(async (resolve, reject) => {
      try {
        const decoded = jwt.decode(accessToken);

        if (decoded === null){
          reject(ErrorUnauthorized("accessToken is invalid"));
        }

        if (decoded.exp < (new Date().getTime() + 1) / 1000) {
          console.log('expired');
          reject(ErrorUnauthorized("accessToken expired"));
        }

        const obj = await db.findOne({
          where: { username: decoded.username },
          include: [{ all: true, nested: true }],
        });

        if (!obj) {
          reject(ErrorUnauthorized("Username not found"));
        }
        resolve({ accessToken: accessToken, userData: obj });
      } catch (error) {
        reject(error);
      }
    });
  },

  getIcitAccount(id) {
    let config = {
      method: "post",
      url: "https://api.account.kmutnb.ac.th/api/account-api/user-info",
      headers: { Authorization: "Bearer " + apiToken },
      data: { username: id },
    };

    return new Promise(async (resolve, reject) => {
        try {
          const accountObj = await axios(config)
            .then((response) => {
              return response.data;
            })
            .catch((error) => reject(error));

          if (accountObj.api_status_code == "201") {
            let accountData = {
              username: accountObj.userInfo.username,
              name: accountObj.userInfo.displayname,
              email: accountObj.userInfo.email,
              citizen_id: "",
              account_type: accountObj.userInfo.account_type == "personel" ? 3 : 1,
              icit_account_type: accountObj.userInfo.account_type

            };
            // resolve(accountObj.userInfo);
            resolve(accountData);
          } else if (accountObj.api_status_code == "501") {
            reject(ErrorNotFound("ไม่พบบัญชีผู้ใช้งาน"));
          } else {
            reject(ErrorBadRequest(accountObj));
          }
        } catch (error) {
          // console.error(err);
          reject(error);
        }
    });
  },

  importIcitAccount(id) {
    return new Promise(async (resolve, reject) => {
      try {
          const accountObj = await methods.getIcitAccount(id);

          const obj = await db.findOne({
              where: { username : accountObj.username },
          });

          let saveObj = null;
          // resolve(accountObj.username);
          if (!obj) {
              saveObj = methods.insert(accountObj);
          }else{
              saveObj = methods.update(obj.user_id, accountObj);
          }
          // resolve(accountObj.username);
          resolve(saveObj);
      } catch (error) {
          reject(ErrorBadRequest(error.message));
      }
    });
  },



};

module.exports = { ...methods };
