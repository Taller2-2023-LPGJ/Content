const service = require('../services/statistics');

const post = (req, res) => {
    const { username } = req.params;
    const { startdate , finaldate} = req.query;
    service.post(username, startdate, finaldate)
        .then((data) => {
            res.status(200).json(data);
        })
        .catch((err) => {
            res.status(err.statusCode ?? 500).json({ message: err.message ?? 'An unexpected error has occurred. Please try again later.'});
        });
}

module.exports = {
    post
}
