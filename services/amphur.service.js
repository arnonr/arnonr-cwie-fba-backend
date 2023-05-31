const config = require("../configs/app"),
  db = require("../models/Amphur"),
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

    if (req.query.amphur_id) $where["amphur_id"] = req.query.amphur_id;

    if (req.query.amphur_code)
      $where["amphur_code"] = {
        [Op.like]: "%" + req.query.amphur_code + "%",
      };

    if (req.query.name_th)
      $where["name_th"] = {
        [Op.like]: "%" + req.query.name_th + "%",
      };

    if (req.query.name_en)
      $where["name_en"] = {
        [Op.like]: "%" + req.query.name_en + "%",
      };

    if (req.query.province_id) $where["province_id"] = req.query.province_id;

    if (req.query.active) $where["active"] = req.query.active;

    if (req.query.created_by) $where["created_by"] = req.query.created_by;

    if (req.query.updated_at) $where["updated_at"] = req.query.updated_at;

    //
    const query = Object.keys($where).length > 0 ? { where: $where } : {};

    // Order
    $order = [["name_th", "ASC"]];

    if (req.query.orderByField && req.query.orderBy)
      $order = [
        [
          req.query.orderByField,
          req.query.orderBy.toLowerCase() == "desc" ? "desc" : "asc",
        ],
      ];

    query["order"] = $order;

    query["include"] = [];

    if (req.query.includeAll) {
      query["include"].unshift({ all: true, required: false });
    }

    // query["include"] = [{ all: true, required: false }];

    // if (!isNaN(limit)) query["limit"] = limit;
    // if (!isNaN(offset)) query["offset"] = offset;

    return { query: query };
  },

  find(req) {
    const limit = +(req.query.size || config.pageLimit);
    const offset = +(limit * ((req.query.page || 1) - 1));

    const _q = methods.scopeSearch(req, limit, offset);

    return new Promise(async (resolve, reject) => {
      try {

        Promise.all([
          db.findAll({ ..._q.query, limit: limit, offset: offset }),
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
        const res = methods.findById(inserted.amphur_id);

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
        await db.update(data, { where: { amphur_id: id } });
        let res = methods.findById(obj.amphur_id);

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
          where: { amphur_id: id },
        });

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
