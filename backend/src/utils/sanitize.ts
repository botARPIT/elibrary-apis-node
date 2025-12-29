import sanitizeHtml from 'sanitize-html'

const defaultOptions: sanitizeHtml.IOptions = {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "discard"
}

export const sanitizeInput = (input: string): string => {
    return sanitizeHtml(input, defaultOptions).trim()
}