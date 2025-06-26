# 🍄 Smooth Super Mario - Pygame Edition

A beautiful Pygame version that captures the same smooth, engaging feel as the HTML Mario game!

## 🌟 What Makes This Special

This isn't just another boring Pygame game - it has all the smooth, beautiful features of your HTML version:

### ✨ **Smooth Animations**
- **Squash & stretch effects** when Mario jumps and lands
- **Walking animation** with realistic bobbing
- **Smooth acceleration/deceleration** instead of instant movement
- **Direction-aware eyes** that look where Mario is going
- **Floating coins** with 3D spinning effects

### 🎨 **Beautiful Visuals**
- **Animated gradient background** that shifts colors like the HTML version
- **Glowing coin effects** with dynamic lighting
- **Smooth enemy animations** with walking cycles
- **Professional UI** with glow effects on text
- **Grass texture** that waves in the wind

### 🎮 **Engaging Gameplay**
- **Responsive controls** that feel natural
- **Variable jump height** (hold space longer for higher jumps)
- **Smart collision detection** with proper enemy stomping
- **Smooth physics** with momentum and gravity
- **Win condition** - collect all coins to win!

## 🚀 How to Play

### Requirements
```bash
pip install pygame
```

### Run the Game
```bash
cd pygame-mario
python3 smooth_mario_pygame.py
```

### Controls
- **Arrow Keys / WASD**: Move Mario (smooth acceleration!)
- **Space**: Jump (hold for higher jumps!)
- **ESC**: Quit game

### Goal
🎯 **Collect all the spinning golden coins to win!**
💥 **Jump on brown enemies to defeat them!**

## 🎨 Features Comparison

| Feature | HTML Version | Pygame Version |
|---------|-------------|----------------|
| Smooth animations | ✅ | ✅ |
| Beautiful graphics | ✅ | ✅ |
| Responsive controls | ✅ | ✅ |
| Animated background | ✅ | ✅ |
| Spinning coins | ✅ | ✅ |
| Squash & stretch | ❌ | ✅ |
| Glow effects | ❌ | ✅ |
| Desktop app | ❌ | ✅ |

## 🛠️ Technical Highlights

### **Smooth Movement System**
```python
# Smooth acceleration instead of instant movement
self.vel_x += (target_speed - self.vel_x) * 0.15
```

### **Squash & Stretch Animation**
```python
# Professional animation technique
if jumping:
    self.jump_squash = 0.7  # Squash
elif landing:
    self.jump_squash = 1.2  # Stretch
```

### **3D Coin Spinning**
```python
# Realistic 3D rotation effect
spin_width = abs(math.sin(self.spin_angle)) * self.width
```

### **Animated Background**
```python
# Shifting gradient colors like HTML version
r = int(135 * (1 - ratio + shift) + 255 * ratio)
```

## 🎯 Why This Version is Great

### **Best of Both Worlds**
- **HTML version**: Easy to share, runs anywhere
- **Pygame version**: Smooth animations, desktop app, more features

### **Perfect for Learning**
- Clean, readable code structure
- Professional animation techniques
- Modern game development patterns
- Easy to modify and extend

### **Engaging Gameplay**
- Smooth, responsive controls
- Beautiful visual feedback
- Satisfying animations
- Clear objectives

## 🎮 Try Both Versions!

1. **HTML Version**: `../smooth-mario.html` - Great for sharing
2. **Pygame Version**: `smooth_mario_pygame.py` - Great for desktop

Both are fun, but the Pygame version adds extra polish and smooth animations that make it feel even more professional!

---

**🍄 Enjoy your smooth Mario adventure in Pygame!** ✨
