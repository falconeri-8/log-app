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
          profiles: results,
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

const validateImage = async (image) => {
    if (image.size > 5 * 1024 * 1024) {
        throw new Error('Image size limit 5MB')
    }
    return image;
}

module.exports = {
    sort
}