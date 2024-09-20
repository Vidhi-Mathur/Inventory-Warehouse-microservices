const axios = require('axios');

exports.getUserById = async(userId) => {
    try {
        const response = await axios.get(`http://localhost:3002/${userId}`);
        return response.user
    }
    catch(error) {
        next(err)
    }
}