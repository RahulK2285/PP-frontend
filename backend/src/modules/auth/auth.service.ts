import jwt from 'jsonwebtoken';
import { CONFIG } from '../../config/constants';
import { User, IUser } from './user.model';

const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, CONFIG.JWT_SECRET, {
    expiresIn: CONFIG.JWT_EXPIRY,
  } as jwt.SignOptions);
};

export const authService = {
  async register(data: {
    name: string;
    email: string;
    password: string;
    leetcodeUsername?: string;
  }) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const user = await User.create(data);
    const token = generateToken(String(user._id));

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        leetcodeUsername: user.leetcodeUsername,
        role: user.role,
      },
    };
  },

  async login(email: string, password: string) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = generateToken(String(user._id));

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        leetcodeUsername: user.leetcodeUsername,
        role: user.role,
      },
    };
  },

  async getProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      leetcodeUsername: user.leetcodeUsername,
      role: user.role,
      createdAt: user.createdAt,
    };
  },

  async updateProfile(userId: string, data: { name?: string; leetcodeUsername?: string }) {
    const user = await User.findByIdAndUpdate(userId, data, { new: true, runValidators: true });
    if (!user) throw new Error('User not found');
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      leetcodeUsername: user.leetcodeUsername,
      role: user.role,
    };
  },
};
