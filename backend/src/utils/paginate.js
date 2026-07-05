// src/utils/paginate.js
const paginate = async (model, query = {}, { page = 1, perPage = 20, sort = { createdAt: -1 }, populate = [] } = {}) => {
  const skip = (page - 1) * perPage;
  const total = await model.countDocuments(query);
  let q = model.find(query).sort(sort).skip(skip).limit(perPage);
  populate.forEach(p => { q = q.populate(p); });
  const data = await q;
  return {
    data,
    current_page: page,
    per_page: perPage,
    total,
    last_page: Math.ceil(total / perPage),
  };
};

module.exports = paginate;
