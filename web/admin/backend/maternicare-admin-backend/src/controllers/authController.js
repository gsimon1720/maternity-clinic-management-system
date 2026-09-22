import { authService } from '../services/authService.js';
import { userService } from '../services/userService.js';
import { parseUserUpdateInput } from '../utils/formatters.js';

export const authController = {
  login: async (req, res) => {
    try {
      const nic = req.body.nic ?? req.body.username ?? req.body.email;
      const { password } = req.body;
      const result = await authService.login(nic, password);

      if (!result.success) {
        return res.status(401).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message,
      });
    }
  },

  getCurrentUser: async (req, res) => {
    try {
      const result = await authService.getCurrentUser(req.user.user_id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json({
        success: true,
        user: result.user,
        clinic: result.clinic,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to get user',
        error: error.message,
      });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.user_id;
      const result = await authService.changePassword(
        userId,
        currentPassword,
        newPassword
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to change password',
        error: error.message,
      });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const data = parseUserUpdateInput(req.body);

      const result = await userService.updateUser(userId, data);

      if (!result.success) {
        return res.status(400).json(result);
      }

      const freshUser = await authService.getCurrentUser(userId);

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: freshUser.user,
        clinic: freshUser.clinic,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message,
      });
    }
  },
};
