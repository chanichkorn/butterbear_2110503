import bcrypt from 'bcryptjs';
import { User, Session } from '../models.js';
import { issueSession } from '../auth.js';
import { ApiError, text, email, password } from '../validation.js';

export const register = async (req, res) => {
  const user = await User.create({
    name: text(req.body.name, 'name', 100),
    phone: text(req.body.phone, 'phone', 30),
    email: email(req.body.email),
    password: await bcrypt.hash(password(req.body.password), 12),
    role: 'user',
  });
  const token = await issueSession(user);
  res.status(201).json({ success: true, token, data: user });
};

export const login = async (req, res) => {
  const address = email(req.body.email);
  const secret = password(req.body.password);
  const user = await User.findOne({ email: address }).select('+password');
  if (!user || !await bcrypt.compare(secret, user.password)) {
    throw new ApiError(401, 'Invalid credentials');
  }
  const token = await issueSession(user);
  res.json({ success: true, token, data: user });
};

export const getMe = (req, res) => {
  res.json({ success: true, data: req.user });
};

export const logout = async (req, res) => {
  await Session.deleteOne({ _id: req.sessionId, user: req.user._id });
  res.json({ success: true, message: 'Logged out' });
};
