#!/usr/bin/env python3
"""
Super Mario - Pygame Version
Mario game with smooth animations, just like the HTML version!
"""

import pygame
import math
import random
import sys

# Initialize Pygame
pygame.init()

# Game settings - same feel as HTML version
WINDOW_WIDTH = 800
WINDOW_HEIGHT = 600
FPS = 60

# Colors - matching HTML version
SKY_BLUE = (135, 206, 235)
GROUND_GREEN = (144, 238, 144)
MARIO_RED = (255, 0, 0)
MARIO_BLUE = (0, 0, 255)
MARIO_SKIN = (255, 220, 177)
COIN_GOLD = (255, 215, 0)
ENEMY_BROWN = (139, 69, 19)
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)

class SmoothMario:
    def __init__(self):
        self.x = 100.0
        self.y = 400.0
        self.width = 32
        self.height = 32
        self.vel_x = 0.0
        self.vel_y = 0.0
        self.on_ground = False
        self.direction = 1
        
        # Smooth animation variables
        self.walk_cycle = 0.0
        self.jump_squash = 1.0
        self.bob_offset = 0.0
        
    def update(self, keys):
        # Smooth horizontal movement with momentum
        target_speed = 0
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            target_speed = -6
            self.direction = -1
        elif keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            target_speed = 6
            self.direction = 1
        
        # Smooth acceleration/deceleration
        self.vel_x += (target_speed - self.vel_x) * 0.15
        
        # Smooth jumping
        if (keys[pygame.K_SPACE] or keys[pygame.K_UP] or keys[pygame.K_w]) and self.on_ground:
            self.vel_y = -16
            self.on_ground = False
            self.jump_squash = 0.7  # Squash effect
        
        # Smooth gravity
        self.vel_y += 0.8
        
        # Update position
        self.x += self.vel_x
        self.y += self.vel_y
        
        # Ground collision
        if self.y > 400:
            self.y = 400
            self.vel_y = 0
            self.on_ground = True
            if self.jump_squash < 1.0:
                self.jump_squash = 1.2  # Stretch on landing
        
        # Screen boundaries
        if self.x < 0:
            self.x = 0
        elif self.x > WINDOW_WIDTH - self.width:
            self.x = WINDOW_WIDTH - self.width
        
        # Update animations
        self._update_animations()
    
    def _update_animations(self):
        # Walking animation
        if abs(self.vel_x) > 0.5 and self.on_ground:
            self.walk_cycle += abs(self.vel_x) * 0.1
            self.bob_offset = math.sin(self.walk_cycle) * 2
        else:
            self.bob_offset *= 0.9
        
        # Smooth squash recovery
        self.jump_squash += (1.0 - self.jump_squash) * 0.1
    
    def draw(self, screen):
        # Calculate draw position with animations
        draw_x = int(self.x)
        draw_y = int(self.y + self.bob_offset)
        
        # Apply squash and stretch
        draw_width = int(self.width * (2 - self.jump_squash))
        draw_height = int(self.height * self.jump_squash)
        
        # Mario body (red shirt)
        body_rect = pygame.Rect(draw_x, draw_y, draw_width, draw_height)
        pygame.draw.rect(screen, MARIO_RED, body_rect)
        
        # Overalls (blue)
        overall_rect = pygame.Rect(draw_x + 4, draw_y + draw_height//3, 
                                 draw_width - 8, draw_height//2)
        pygame.draw.rect(screen, MARIO_BLUE, overall_rect)
        
        # Hat
        hat_rect = pygame.Rect(draw_x + 2, draw_y, draw_width - 4, draw_height//4)
        pygame.draw.rect(screen, MARIO_RED, hat_rect)
        
        # Face
        face_rect = pygame.Rect(draw_x + 6, draw_y + draw_height//4, 
                               draw_width - 12, draw_height//3)
        pygame.draw.rect(screen, MARIO_SKIN, face_rect)
        
        # Eyes (direction aware)
        eye_size = max(2, draw_width // 8)
        eye_y = draw_y + draw_height//3
        
        if self.direction > 0:  # Looking right
            pygame.draw.circle(screen, BLACK, (draw_x + draw_width//3, eye_y), eye_size)
            pygame.draw.circle(screen, BLACK, (draw_x + 2*draw_width//3, eye_y), eye_size)
        else:  # Looking left
            pygame.draw.circle(screen, BLACK, (draw_x + draw_width//4, eye_y), eye_size)
            pygame.draw.circle(screen, BLACK, (draw_x + 3*draw_width//4, eye_y), eye_size)
        
        # Mustache
        mustache_rect = pygame.Rect(draw_x + draw_width//4, draw_y + draw_height//2, 
                                   draw_width//2, max(2, draw_height//16))
        pygame.draw.rect(screen, (101, 67, 33), mustache_rect)

class SmoothEnemy:
    def __init__(self, x, y):
        self.x = float(x)
        self.y = float(y)
        self.width = 28
        self.height = 28
        self.vel_x = -2.0
        self.alive = True
        
        # Animation
        self.walk_cycle = 0.0
        self.bob_offset = 0.0
        
    def update(self):
        if not self.alive:
            return
        
        # Smooth movement
        self.x += self.vel_x
        
        # Bounce off screen edges
        if self.x <= 0 or self.x >= WINDOW_WIDTH - self.width:
            self.vel_x = -self.vel_x
        
        # Walking animation
        self.walk_cycle += abs(self.vel_x) * 0.1
        self.bob_offset = math.sin(self.walk_cycle) * 1.5
    
    def draw(self, screen):
        if not self.alive:
            return
        
        draw_x = int(self.x)
        draw_y = int(self.y + self.bob_offset)
        
        # Goomba body
        body_rect = pygame.Rect(draw_x, draw_y, self.width, self.height)
        pygame.draw.rect(screen, ENEMY_BROWN, body_rect)
        
        # Darker outline
        pygame.draw.rect(screen, (100, 50, 20), body_rect, 2)
        
        # Face
        face_rect = pygame.Rect(draw_x + 4, draw_y + 4, self.width - 8, self.height - 8)
        pygame.draw.rect(screen, (160, 82, 45), face_rect)
        
        # Eyes with animation
        eye_offset = int(math.sin(self.walk_cycle) * 1)
        eye_y = draw_y + 8 + eye_offset
        
        pygame.draw.circle(screen, WHITE, (draw_x + 8, eye_y), 3)
        pygame.draw.circle(screen, WHITE, (draw_x + 20, eye_y), 3)
        pygame.draw.circle(screen, BLACK, (draw_x + 8, eye_y), 2)
        pygame.draw.circle(screen, BLACK, (draw_x + 20, eye_y), 2)
        
        # Angry eyebrows
        pygame.draw.rect(screen, BLACK, (draw_x + 6, draw_y + 4, 6, 2))
        pygame.draw.rect(screen, BLACK, (draw_x + 16, draw_y + 4, 6, 2))
        
        # Frown
        pygame.draw.rect(screen, BLACK, (draw_x + 10, draw_y + 18, 8, 2))

class SmoothCoin:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.width = 16
        self.height = 20
        self.collected = False
        
        # Smooth animations
        self.spin_angle = 0.0
        self.float_cycle = random.uniform(0, math.pi * 2)
        self.glow_intensity = 0.0
        
    def update(self):
        if self.collected:
            return
        
        # Smooth spinning
        self.spin_angle += 0.15
        
        # Floating animation
        self.float_cycle += 0.08
        
        # Glow effect
        self.glow_intensity = (math.sin(pygame.time.get_ticks() * 0.01) + 1) * 0.5
    
    def draw(self, screen):
        if self.collected:
            return
        
        # Floating offset
        float_offset = math.sin(self.float_cycle) * 3
        draw_x = self.x
        draw_y = int(self.y + float_offset)
        
        # 3D spinning effect
        spin_width = abs(math.sin(self.spin_angle)) * self.width
        
        if spin_width > 2:
            # Glow effect
            if self.glow_intensity > 0.3:
                glow_size = int(20 + self.glow_intensity * 8)
                glow_surface = pygame.Surface((glow_size * 2, glow_size * 2), pygame.SRCALPHA)
                pygame.draw.circle(glow_surface, (255, 215, 0, 50), (glow_size, glow_size), glow_size)
                screen.blit(glow_surface, (draw_x + self.width//2 - glow_size, 
                                         draw_y + self.height//2 - glow_size))
            
            # Coin body
            coin_rect = pygame.Rect(draw_x + (self.width - spin_width) // 2, 
                                   draw_y, spin_width, self.height)
            pygame.draw.rect(screen, COIN_GOLD, coin_rect)
            
            # Shine effect
            if spin_width > 8:
                shine_rect = pygame.Rect(coin_rect.x + 1, coin_rect.y + 2, 
                                       max(1, spin_width - 2), 3)
                pygame.draw.rect(screen, WHITE, shine_rect)
                
                # Bottom shine
                shine_rect2 = pygame.Rect(coin_rect.x + 1, coin_rect.y + self.height - 5, 
                                        max(1, spin_width - 2), 3)
                pygame.draw.rect(screen, (255, 235, 100), shine_rect2)

class SmoothMarioGame:
    def __init__(self):
        self.screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
        pygame.display.set_caption('🍄 Super Mario - Pygame Edition')
        self.clock = pygame.time.Clock()
        
        # Game objects
        self.mario = SmoothMario()
        self.enemies = [
            SmoothEnemy(300, 372),
            SmoothEnemy(500, 372),
            SmoothEnemy(650, 372)
        ]
        self.coins = [
            SmoothCoin(250, 320),
            SmoothCoin(400, 280),
            SmoothCoin(550, 300),
            SmoothCoin(700, 250)
        ]
        
        self.score = 0
        self.running = True
        
        # Background animation
        self.bg_shift = 0.0
        
        # Font
        self.font = pygame.font.Font(None, 36)
        self.font_small = pygame.font.Font(None, 24)
    
    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    self.running = False
    
    def update(self):
        keys = pygame.key.get_pressed()
        
        # Update game objects
        self.mario.update(keys)
        
        for enemy in self.enemies:
            enemy.update()
        
        for coin in self.coins:
            coin.update()
        
        # Background animation
        self.bg_shift += 0.01
        
        # Collision detection
        self._check_collisions()
    
    def _check_collisions(self):
        mario_rect = pygame.Rect(self.mario.x, self.mario.y, self.mario.width, self.mario.height)
        
        # Mario vs Enemies
        for enemy in self.enemies:
            if not enemy.alive:
                continue
            
            enemy_rect = pygame.Rect(enemy.x, enemy.y, enemy.width, enemy.height)
            if mario_rect.colliderect(enemy_rect):
                if self.mario.vel_y > 0 and self.mario.y < enemy.y:
                    # Mario defeats enemy
                    enemy.alive = False
                    self.mario.vel_y = -8  # Bounce
                    self.score += 100
                else:
                    # Reset Mario (simple damage)
                    self.mario.x = 100
                    self.mario.y = 400
                    self.mario.vel_x = 0
                    self.mario.vel_y = 0
        
        # Mario vs Coins
        for coin in self.coins:
            if coin.collected:
                continue
            
            coin_rect = pygame.Rect(coin.x, coin.y, coin.width, coin.height)
            if mario_rect.colliderect(coin_rect):
                coin.collected = True
                self.score += 50
    
    def draw_background(self):
        # Animated gradient background like HTML version
        for y in range(WINDOW_HEIGHT):
            # Create shifting colors
            ratio = y / WINDOW_HEIGHT
            shift = math.sin(self.bg_shift) * 0.2
            
            r = int(135 * (1 - ratio + shift) + 255 * ratio)
            g = int(206 * (1 - ratio) + 238 * ratio)
            b = int(235 * (1 - ratio) + 144 * ratio)
            
            # Clamp values
            r = max(0, min(255, r))
            g = max(0, min(255, g))
            b = max(0, min(255, b))
            
            pygame.draw.line(self.screen, (r, g, b), (0, y), (WINDOW_WIDTH, y))
    
    def draw_ground(self):
        # Ground with grass effect
        ground_rect = pygame.Rect(0, 432, WINDOW_WIDTH, WINDOW_HEIGHT - 432)
        pygame.draw.rect(self.screen, GROUND_GREEN, ground_rect)
        
        # Grass texture
        for x in range(0, WINDOW_WIDTH, 20):
            grass_height = int(8 + math.sin(x * 0.1 + self.bg_shift * 5) * 3)
            pygame.draw.rect(self.screen, (34, 139, 34), (x, 432, 18, grass_height))
    
    def draw_ui(self):
        # Score with glow effect
        score_text = f'Score: {self.score}'
        
        # Glow
        for offset in [(1, 1), (-1, -1), (1, -1), (-1, 1)]:
            glow_surface = self.font.render(score_text, True, (100, 100, 100))
            self.screen.blit(glow_surface, (10 + offset[0], 10 + offset[1]))
        
        # Main text
        score_surface = self.font.render(score_text, True, WHITE)
        self.screen.blit(score_surface, (10, 10))
        
        # Instructions
        instructions = 'Arrow Keys/WASD: Move  |  Space: Jump  |  ESC: Quit'
        inst_surface = self.font_small.render(instructions, True, WHITE)
        self.screen.blit(inst_surface, (10, 50))
        
        # Goal
        remaining_coins = sum(1 for coin in self.coins if not coin.collected)
        if remaining_coins > 0:
            goal_text = f'Collect {remaining_coins} more coins!'
            goal_surface = self.font_small.render(goal_text, True, COIN_GOLD)
            self.screen.blit(goal_surface, (10, 75))
        else:
            win_text = '🎉 All coins collected! You win! 🎉'
            win_surface = self.font.render(win_text, True, COIN_GOLD)
            win_rect = win_surface.get_rect(center=(WINDOW_WIDTH//2, 100))
            self.screen.blit(win_surface, win_rect)
    
    def draw(self):
        # Draw background
        self.draw_background()
        
        # Draw ground
        self.draw_ground()
        
        # Draw game objects
        for coin in self.coins:
            coin.draw(self.screen)
        
        for enemy in self.enemies:
            enemy.draw(self.screen)
        
        self.mario.draw(self.screen)
        
        # Draw UI
        self.draw_ui()
        
        pygame.display.flip()
    
    def run(self):
        print("🍄 Super Mario - Pygame Edition")
        print("=" * 40)
        print("🎮 Controls:")
        print("  Arrow Keys / WASD: Move Mario")
        print("  Space: Jump")
        print("  ESC: Quit")
        print()
        print("🎯 Goal: Collect all the spinning coins!")
        print("💡 Tip: Jump on enemies to defeat them!")
        print("=" * 40)
        
        while self.running:
            self.handle_events()
            self.update()
            self.draw()
            self.clock.tick(FPS)
        
        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    game = SmoothMarioGame()
    game.run()
