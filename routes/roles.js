var express = require('express');
var router = express.Router();
let roleModel = require('../schemas/roles');

// GET all roles (không lấy isDeleted)
router.get('/', async function (req, res, next) {
    try {
        let roles = await roleModel.find({ isDeleted: false });
        res.send(roles);
    } catch (error) {
        res.status(500).send({ message: "Lỗi server", error });
    }
});

// GET role by ID
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await roleModel.findById(id);
        if (!result || result.isDeleted) {
            return res.status(404).send({ message: "Không tìm thấy Role với ID này" });
        }
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: "Không tìm thấy Role với ID này" });
    }
});

// GET all users belong to a role: /roles/:id/users
router.get('/:id/users', async function (req, res, next) {
    try {
        let roleId = req.params.id;
        // Kiểm tra role tồn tại
        let role = await roleModel.findById(roleId);
        if (!role || role.isDeleted) {
            return res.status(404).send({ message: "Không tìm thấy Role với ID này" });
        }
        let userModel = require('../schemas/users');
        let users = await userModel.find({ role: roleId, isDeleted: false }).populate('role');
        res.send(users);
    } catch (error) {
        res.status(500).send({ message: "Lỗi server", error });
    }
});

// POST tạo role mới
router.post('/', async function (req, res, next) {
    try {
        let newRole = new roleModel({
            name: req.body.name,
            description: req.body.description
        });
        await newRole.save();
        res.status(201).send(newRole);
    } catch (error) {
        res.status(400).send({ message: "Tạo Role thất bại", error });
    }
});

// PUT cập nhật role
router.put('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await roleModel.findById(id);
        if (!result || result.isDeleted) {
            return res.status(404).send({ message: "Không tìm thấy Role với ID này" });
        }
        let updated = await roleModel.findByIdAndUpdate(id, req.body, { new: true });
        res.send(updated);
    } catch (error) {
        res.status(400).send({ message: "Cập nhật thất bại", error });
    }
});

// DELETE xoá mềm role
router.delete('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await roleModel.findById(id);
        if (!result || result.isDeleted) {
            return res.status(404).send({ message: "Không tìm thấy Role với ID này" });
        }
        result.isDeleted = true;
        await result.save();
        res.send({ message: "Xoá Role thành công", data: result });
    } catch (error) {
        res.status(404).send({ message: "Không tìm thấy Role với ID này" });
    }
});

module.exports = router;
