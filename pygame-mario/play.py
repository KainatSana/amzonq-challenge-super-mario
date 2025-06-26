#!/usr/bin/env python3
"""
🍄 Smooth Mario Pygame Launcher
Launch the beautiful Pygame Mario game!
"""

import subprocess
import sys
import os

def main():
    print("🍄" * 25)
    print("    SMOOTH SUPER MARIO")
    print("      Pygame Edition")
    print("🍄" * 25)
    print()
    
    print("🌟 This version has all the smooth animations")
    print("   and beautiful effects of the HTML version,")
    print("   plus extra polish for desktop!")
    print()
    
    print("✨ Special Features:")
    print("  🎨 Squash & stretch animations")
    print("  🌈 Animated gradient background")
    print("  💫 Glowing coin effects")
    print("  🏃 Smooth character movement")
    print("  👀 Direction-aware eyes")
    print()
    
    print("🎮 Controls:")
    print("  ← → Arrow Keys / A D: Move")
    print("  Space / ↑ / W: Jump")
    print("  ESC: Quit")
    print()
    
    print("🎯 Goal: Collect all spinning coins!")
    print()
    
    # Check if pygame is installed
    try:
        import pygame
        print("✅ Pygame is ready!")
    except ImportError:
        print("❌ Pygame not found. Installing...")
        subprocess.run([sys.executable, "-m", "pip", "install", "pygame", "--user"])
        print("✅ Pygame installed!")
    
    print()
    print("🚀 Starting Smooth Mario Pygame Edition...")
    print("=" * 50)
    
    try:
        subprocess.run([sys.executable, "smooth_mario_pygame.py"])
    except FileNotFoundError:
        print("❌ Game file not found!")
        print("Make sure smooth_mario_pygame.py is in this directory.")
    except KeyboardInterrupt:
        print("\n👋 Game closed. Thanks for playing!")

if __name__ == "__main__":
    main()
