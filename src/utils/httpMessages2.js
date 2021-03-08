function code500(
    response = {},
    message = 'Something went wrong please try again.',
) {
    return {
        message,
        response,
    };
}

function code422(response = {}, message = 'Required fields are missing.') {
    return {
        message,
        response,
    };
}

function code403(response = {}, message = 'Access Denied.') {
    return {
        message,
        response,
    };
}

function code401(response = {}, message = 'Unauthorized.') {
    return {
        message,
        response,
    };
}

function code404(response = {}, message = 'Resource Not Found.') {
    return {
        message,
        response,
    };
}

function code204(response = {}, message = 'Resource Found.') {
    return {
        message,
        response,
    };
}

function code200(response = {}, message = 'Success.') {
    return {
        message,
        response,
    };
}

function code409(response = {}, message = 'User already exists.') {
    return {
        message,
        response,
    };
}

module.exports = {
    code200,
    code204,
    code401,
    code403,
    code404,
    code409,
    code422,
    code500,
};
