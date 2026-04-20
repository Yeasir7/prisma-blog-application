type iOptions = {
  page?: string;
  limit?: string;
  sortOrder?: string;
  sortBy?: string;
};

type iOptionsResults = {
    page: number;
    limit: number;
    skip: number;
    sortOrder: string;
    sortBy: string;
}

const paginationAndSortingHelper = (options: iOptions) : iOptionsResults => {
    const page : number = Number(options.page) || 1
    const limit : number = Number(options.limit) || 200

    const skip = (page - 1) * limit;

    const sortBy : string = options.sortBy || "createdAt";
    const sortOrder : string = options.sortOrder || "desc";
    return {
        page,
        limit,
        skip,
        sortBy,
        sortOrder
    }
};

export default paginationAndSortingHelper;
