module.exports = {
    pathFromConfigAndModel: (config) => {
        let apiPrefix = config.apiPrefix ? config.apiPrefix : '';
        let apiEntityRewrite = config.apiEntityRewrite ? config.apiEntityRewrite: '';
        let modelName = config.model.name;

        if (apiPrefix[0] !== '/'[0]) apiPrefix = `/${apiPrefix}`;
        if (apiPrefix.length === 1) apiPrefix = '';

        if (apiPrefix[apiPrefix.length -1] === '/'[0]) apiPrefix = apiPrefix.substring(0, apiPrefix.length - 1);
        if (apiEntityRewrite[apiEntityRewrite.length -1] === '/'[0]) apiEntityRewrite = apiEntityRewrite.substring(0, apiEntityRewrite.length - 1);
        if (modelName[modelName.length -1] === '/'[0]) modelName = modelName.substring(0, modelName.length - 1);

        return `${apiPrefix}/${apiEntityRewrite ? apiEntityRewrite : modelName}`;
    }
}
