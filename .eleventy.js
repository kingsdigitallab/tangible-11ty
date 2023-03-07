
module.exports = function (config) {
    config.addPassthroughCopy("assets");
    return {
        dir: {
        input: "tangible",
            output:"_site"
        },
        pathPrefix: "/tangible-11ty/",
    }
}