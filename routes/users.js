var express = require('express');
var router = express.Router();
let userModel = require('../schemas/users');

// GET all users (không lấy isDeleted)
router.get('/', async function (req, res, next) {
    try {
        let users = await userModel.find({ isDeleted: false }).populate('role');
        res.send(users);
    } catch (error) {
        res.status(500).send({ message: "Lỗi server", error });
    }
});

// GET user by ID
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await userModel.findById(id).populate('role');
        if (!result || result.isDeleted) {
            return res.status(404).send({ message: "Không tìm thấy User với ID này" });
        }
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: "Không tìm thấy User với ID này" });
    }
});

// POST tạo user mới
router.post('/', async function (req, res, next) {
    try {
        let newUser = new userModel({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            role: req.body.role
        });
        await newUser.save();
        res.status(201).send(newUser);
    } catch (error) {
        res.status(400).send({ message: "Tạo User thất bại", error });
    }
});

// PUT cập nhật user
router.put('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await userModel.findById(id);
        if (!result || result.isDeleted) {
            return res.status(404).send({ message: "Không tìm thấy User với ID này" });
        }
        let updated = await userModel.findByIdAndUpdate(id, req.body, { new: true });
        res.send(updated);
    } catch (error) {
        res.status(400).send({ message: "Cập nhật thất bại", error });
    }
});

// DELETE xoá mềm user
router.delete('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await userModel.findById(id);
        if (!result || result.isDeleted) {
            return res.status(404).send({ message: "Không tìm thấy User với ID này" });
        }
        result.isDeleted = true;
        await result.save();
        res.send({ message: "Xoá User thành công", data: result });
    } catch (error) {
        res.status(404).send({ message: "Không tìm thấy User với ID này" });
    }
});

// POST /enable - Kích hoạt user (status = true)
// Body: { email, username }
router.post('/enable', async function (req, res, next) {
    try {
        let { email, username } = req.body;
        if (!email || !username) {
            return res.status(400).send({ message: "Vui lòng cung cấp email và username" });
        }
        let user = await userModel.findOne({ email, username, isDeleted: false });
        if (!user) {
            return res.status(404).send({ message: "Không tìm thấy user với email và username đã cung cấp" });
        }
        user.status = true;
        await user.save();
        res.send({ message: "Kích hoạt tài khoản thành công", data: user });
    } catch (error) {
        res.status(500).send({ message: "Lỗi server", error });
    }
});

// POST /disable - Vô hiệu hoá user (status = false)
// Body: { email, username }
router.post('/disable', async function (req, res, next) {
    try {
        let { email, username } = req.body;
        if (!email || !username) {
            return res.status(400).send({ message: "Vui lòng cung cấp email và username" });
        }
        let user = await userModel.findOne({ email, username, isDeleted: false });
        if (!user) {
            return res.status(404).send({ message: "Không tìm thấy user với email và username đã cung cấp" });
        }
        user.status = false;
        await user.save();
        res.send({ message: "Vô hiệu hoá tài khoản thành công", data: user });
    } catch (error) {
        res.status(500).send({ message: "Lỗi server", error });
    }
});

module.exports = router;
