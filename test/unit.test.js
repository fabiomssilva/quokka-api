const { pathFromConfigAndModel } = require('../lib/functions');


const config = {
    model: { name: 'user' }, //mock data
    apiPrefix: '/v1/quokka', // What is the path prefix (optional)
    apiEntityRewrite: 'users', // If table name is to be renamed (optional)
};

test('Test no Predfix', async () => {
    const localConfig = { ...config };
    delete localConfig.apiPrefix;
    const result = pathFromConfigAndModel(localConfig);
    expect(result).toBe('/users');
});

test('apiPrefix starts with /', async () => {
    const localConfig = { ...config };
    const result = pathFromConfigAndModel(localConfig);
    expect(result).toBe('/v1/quokka/users');
});

test('apiPrefix starts without /', async () => {
    const localConfig = { ...config, apiPrefix: 'v1/quokka' };
    const result = pathFromConfigAndModel(localConfig);
    expect(result).toBe('/v1/quokka/users');
});

test('apiPrefix ends in /', async () => {
    const localConfig = { ...config, apiPrefix: 'v1/quokka/' };
    const result = pathFromConfigAndModel(localConfig);
    expect(result).toBe('/v1/quokka/users');
});


test('apiPrefix do not end in /', async () => {
    const localConfig = { ...config, apiPrefix: 'v1/quokka' };
    const result = pathFromConfigAndModel(localConfig);
    expect(result).toBe('/v1/quokka/users');
});


test('model name user and no rewrite', async () => {
    const localConfig = { ...config, model: { name: 'user' } };
    delete localConfig.apiEntityRewrite;
    const result = pathFromConfigAndModel(localConfig);
    expect(result).toBe('/v1/quokka/user');
});


test('model name bob and no rewrite', async () => {
    const localConfig = { ...config, model: { name: 'bob' } };
    delete localConfig.apiEntityRewrite;
    const result = pathFromConfigAndModel(localConfig);
    expect(result).toBe('/v1/quokka/bob');
});


test('model name bob, no rewrite, finishing with /', async () => {
    const localConfig = { ...config, model: { name: 'bob/' } };
    delete localConfig.apiEntityRewrite;
    const result = pathFromConfigAndModel(localConfig);
    expect(result).toBe('/v1/quokka/bob');
});


test('test apiEntityRewrite ending with /', async () => {
    const localConfig = { ...config, apiEntityRewrite: 'alice/' };
    const result = pathFromConfigAndModel(localConfig);
    expect(result).toBe('/v1/quokka/alice');
});


test('test apiEntityRewrite', async () => {
    const localConfig = { ...config, apiEntityRewrite: 'rita' };
    const result = pathFromConfigAndModel(localConfig);
    expect(result).toBe('/v1/quokka/rita');
});
