// Generates public id for assets stored on cloudinary
export function generatePublicId(assetUrl: string) {
    //Split the url
    let urlArr;
    let publicId;
    if (!assetUrl) throw new Error("Empty url")
    if (assetUrl.includes(".pdf")) {
        urlArr = assetUrl.split("/").slice(-2)
        publicId = `${urlArr[0]}/${urlArr[1]}`
    }
    else {
        urlArr = assetUrl.split("/").slice(-2)
        publicId = `${urlArr[0]}/${urlArr[1]?.split(".")[0] ?? urlArr[1]}`
    }
    if (urlArr.length < 2) throw new Error("The url passed is not a valid url")

    return publicId
}