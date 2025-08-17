const sort = async (collection, page = 1, limit = 10, filter = {}, method = {_id: -1}) => {
    const skip = (page - 1) * limit;

    try {

      const count = await collection.countDocuments(filter)
      const pages = Math.ceil(count / limit)

      const results = await collection
          .find(filter)
          .skip(skip)
          .limit(limit)
          .sort(method)

      return {
          data: results,
          sorting: {
              currentPage: page,
              pages,
              count,
              limit,
              next: page < pages,
              previous: page > 1,
              nextPage: page < pages ? page + 1 : null,
              previousPage: page > 1 ? page - 1 : null,
              start: skip + 1,
              end: Math.min(skip + limit, count)
          }
      }
    } catch (error) {
        throw error;
    }
};

module.exports = {
    sort
}