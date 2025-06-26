#!/usr/bin/env python3
"""
🍄 Super Mario Game Launcher
Choose between HTML or Pygame version - both are awesome!
"""

import subprocess
import sys
import os

def main():
    print("🍄" * 25)
    print("    SUPER MARIO GAMES")
    print("🍄" * 25)
    print()
    print("Choose your Mario adventure:")
    print()
    print("1. 🌐 HTML Version (Browser)")
    print("   ✨ Original smooth game")
    print("   🚀 Runs anywhere, easy to share")
    print("   📱 Works on mobile too!")
    print()
    print("2. 🎮 Pygame Version (Desktop)")
    print("   ✨ Enhanced with extra animations")
    print("   🎨 Squash & stretch effects")
    print("   💫 Glowing coins and smooth physics")
    print()
    
    choice = input("Enter your choice (1 or 2): ").strip()
    
    if choice == "1":
        print("🌐 Opening HTML Mario game in browser...")
        if os.path.exists("smooth-mario.html"):
            subprocess.run(["open", "smooth-mario.html"])
            print("🎮 Game opened in browser!")
        else:
            print("❌ HTML game not found!")
    
    elif choice == "2":
        print("🎮 Starting Pygame Mario game...")
        if os.path.exists("pygame-mario/smooth_mario_pygame.py"):
            os.chdir("pygame-mario")
            subprocess.run([sys.executable, "play.py"])
        else:
            print("❌ Pygame game not found!")
    
    else:
        print("Invalid choice. Please run again and choose 1 or 2.")
        print()
        print("💡 Tip: Try the HTML version first - it's amazing!")

if __name__ == "__main__":
    main()
