class CharacterViewer {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.player = null;
        this.currentCharacterIndex = 0;
        this.characterFiles = CONFIG.characterFiles;
        this.emotions = CONFIG.emotions;
        this.isMenuOpen = false;
        
        this.init();
    }

    async init() {
        try {
            // 获取屏幕尺寸
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            
            // 初始化 EmotePlayer - 使用屏幕尺寸
            EmotePlayer.createRenderCanvas(screenWidth, screenHeight);
            this.player = new EmotePlayer(this.canvas);
            
            // 🎯 调整人物默认大小 - 修改这里的数值来改变人物显示大小
            // 数值范围：0.1-3.0，数值越大人物越大
            this.player.scale = 0.5;
            
            // 调整画布大小以适应屏幕
            this.resizeCanvas();
            
            // 加载所有PSB文件
            await this.loadCharacterFiles();
            
            // 加载第一个角色
            await this.loadCharacter(0);
            
            // 设置事件监听
            this.setupEventListeners();
            
            // 确保画布大小正确并居中人物
            setTimeout(() => {
                this.resizeCanvas();
                this.centerCharacter();
            }, 200);
            
            // 隐藏加载界面
            this.hideLoading();
            
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('初始化失败: ' + error.message);
        }
    }

    async loadCharacterFiles() {
        // 使用配置文件中的文件列表
        this.updateLoadingText(`发现 ${this.characterFiles.length} 个角色文件`);
    }

    async loadCharacter(index) {
        if (index < 0 || index >= this.characterFiles.length) {
            throw new Error('角色索引超出范围');
        }

        this.updateLoadingText(`正在加载角色 ${index + 1}/${this.characterFiles.length}`);
        
        try {
            // 卸载当前角色数据
            if (this.player) {
                this.player.unloadData();
            }
            
            // 加载新角色
            await this.player.promiseLoadDataFromURL(this.characterFiles[index]);
            
            this.currentCharacterIndex = index;
            this.updateCharacterButtons();
            this.updateEmotionButtons();
            
            // 设置默认表情
            this.player.mainTimelineLabel = CONFIG.defaultEmotion;
            
            // 居中显示人物
            this.centerCharacter();
            
            // 🎯 角色加载完成后设置交互功能
            setTimeout(() => {
                this.setupEyeTracking();
                this.setupTouchReactions();
            }, 500);
            
        } catch (error) {
            console.error('加载角色失败:', error);
            throw new Error(`加载角色失败: ${error.message}`);
        }
    }

    setupEventListeners() {
        // 双击打开菜单（桌面端）
        this.canvas.addEventListener('dblclick', () => {
            this.openMenu();
        });

        // 移动端双击检测 - 改进版本
        let lastTap = 0;
        let tapTimeout = null;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 500 && tapLength > 0) {
                // 双击检测
                clearTimeout(tapTimeout);
                this.openMenu();
            } else {
                // 单次点击，设置超时
                tapTimeout = setTimeout(() => {
                    // 单次点击处理（如果需要）
                }, 500);
            }
            lastTap = currentTime;
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        // 缩放滑块
        const scaleSlider = document.getElementById('scaleSlider');
        const scaleValue = document.getElementById('scaleValue');
        
        // 应用配置到缩放滑块
        scaleSlider.min = CONFIG.scaleRange.min;
        scaleSlider.max = CONFIG.scaleRange.max;
        scaleSlider.step = CONFIG.scaleRange.step;
        scaleSlider.value = CONFIG.defaultScale;
        
        scaleSlider.addEventListener('input', (e) => {
            const scale = parseFloat(e.target.value);
            this.player.scale = scale;
            scaleValue.textContent = Math.round(scale * 100) + '%';
        });

        // 关闭菜单按钮
        document.getElementById('closeButton').addEventListener('click', () => {
            this.closeMenu();
        });

        // 点击菜单外部关闭
        document.getElementById('menuOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'menuOverlay') {
                this.closeMenu();
            }
        });

        // 键盘ESC键关闭菜单
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMenu();
            }
        });
    }

    updateEmotionButtons() {
        const container = document.getElementById('emotionButtons');
        container.innerHTML = '';
        
        this.emotions.forEach(emotion => {
            const button = document.createElement('button');
            button.className = 'menu-button';
            button.textContent = emotion;
            button.addEventListener('click', () => {
                this.playEmotion(emotion);
            });
            container.appendChild(button);
        });
    }

    updateCharacterButtons() {
        const container = document.getElementById('characterButtons');
        container.innerHTML = '';
        
        this.characterFiles.forEach((file, index) => {
            const button = document.createElement('button');
            button.className = 'character-button';
            if (index === this.currentCharacterIndex) {
                button.classList.add('active');
            }
            
            // 从文件路径提取角色名称
            const characterName = this.getCharacterName(file);
            button.textContent = characterName;
            
            button.addEventListener('click', async () => {
                if (index !== this.currentCharacterIndex) {
                    try {
                        this.showLoading();
                        await this.loadCharacter(index);
                        this.hideLoading();
                    } catch (error) {
                        this.showError('切换角色失败: ' + error.message);
                    }
                }
            });
            
            container.appendChild(button);
        });
    }

    getCharacterName(filePath) {
        // 从文件路径提取角色名称
        const fileName = filePath.split('/').pop();
        
        // 检查是否有自定义名称映射
        if (CONFIG.characterNames[fileName]) {
            return CONFIG.characterNames[fileName];
        }
        
        // 默认从文件名生成名称
        const nameWithoutExt = fileName.replace(/\.(psb|emtbytes)$/i, '');
        return nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1);
    }

    playEmotion(emotion) {
        try {
            // 直接使用原始表情标签，不使用映射
            this.player.mainTimelineLabel = emotion;
            
            // 清除其他差分动画
            this.player.diffTimelineSlot1 = '';
            this.player.diffTimelineSlot2 = '';
            this.player.diffTimelineSlot3 = '';
            this.player.diffTimelineSlot4 = '';
            
            // 重置变量
            this.player.setVariable('arm_type', 0, 300);
            this.player.setVariable('face_eye_open', 0, 300);
            
            console.log(`播放表情: ${emotion}`);
        } catch (error) {
            console.warn(`播放表情 "${emotion}" 失败:`, error);
        }
    }

    openMenu() {
        this.isMenuOpen = true;
        document.getElementById('menuOverlay').style.display = 'block';
        
        // 更新缩放滑块值
        const scaleSlider = document.getElementById('scaleSlider');
        const scaleValue = document.getElementById('scaleValue');
        scaleSlider.value = this.player.scale;
        scaleValue.textContent = Math.round(this.player.scale * 100) + '%';
    }

    closeMenu() {
        this.isMenuOpen = false;
        document.getElementById('menuOverlay').style.display = 'none';
    }

    updateLoadingText(text) {
        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            loadingText.textContent = text;
        }
    }

    showLoading() {
        document.getElementById('loading').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showError(message) {
        alert('错误: ' + message);
    }

    // 🎯 调整人物显示位置 - 修改这里的数值来改变人物在屏幕上的位置
    centerCharacter() {
        if (this.player) {
            // 获取画布尺寸
            const canvasWidth = this.canvas.width;
            const canvasHeight = this.canvas.height;
            
            // 🎯 人物位置设置 - 使用默认坐标原点(0,0)作为渲染中心
            // 这是WebGL的默认渲染位置，通常不需要调整
            const centerX = 0;
            const centerY = 0;
            
            this.player.setCoord(centerX, centerY);
            
            // 🎯 调试信息 - 在浏览器控制台查看当前设置
            console.log(`画布尺寸: ${canvasWidth}x${canvasHeight}`);
            console.log(`人物位置: ${centerX}, ${centerY}`);
            console.log(`人物缩放: ${this.player.scale}`);
            console.log('💡 调整提示: 修改app.js中的centerCharacter()方法来改变位置，修改scale值来改变大小');
        }
    }

    // 调整画布大小以适应屏幕
    resizeCanvas() {
        // 使用窗口尺寸而不是getBoundingClientRect
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        this.canvas.width = screenWidth;
        this.canvas.height = screenHeight;
        
        // 如果播放器已初始化，重新设置画布并重新居中
        if (this.player) {
            this.player.canvas = this.canvas;
            // 重新居中人物
            setTimeout(() => {
                this.centerCharacter();
            }, 100);
        }
    }

    // 🎯 视线跟踪功能 - 让角色跟随鼠标/触摸移动视线，默认看向前方
    setupEyeTracking() {
        if (!this.player) return;

        let isTracking = false;
        let resetTimeout = null;

        // 🎯 重置视线到前方
        const resetEyeTracking = () => {
            try {
                // 重置所有视线跟踪变量到0（前方）
                this.player.setVariableDiff('eyetrack', 'face_eye_LR', 0, 800, -1);
                this.player.setVariableDiff('eyetrack', 'face_eye_UD', 0, 800, -1);
                this.player.setVariableDiff('eyetrack', 'head_slant', 0, 1000, -1);
                this.player.setVariableDiff('eyetrack', 'head_LR', 0, 1000, -1);
                this.player.setVariableDiff('eyetrack', 'head_UD', 0, 1000, -1);
                this.player.setVariableDiff('eyetrack', 'body_slant', 0, 1500, -1);
                this.player.setVariableDiff('eyetrack', 'body_LR', 0, 1500, -1);
                this.player.setVariableDiff('eyetrack', 'body_UD', 0, 1500, -1);
                
                isTracking = false;
                console.log('视线已重置到前方');
            } catch (error) {
                console.warn('重置视线失败:', error);
            }
        };

        const eyeTrackingReaction = (ev) => {
            try {
                const eyePosition = this.player.getMarkerPosition('eye');
                if (!eyePosition) return;

                // 清除重置定时器
                if (resetTimeout) {
                    clearTimeout(resetTimeout);
                    resetTimeout = null;
                }

                isTracking = true;
                const mouseOffsetX = ev.clientX - eyePosition.clientX;
                const mouseOffsetY = ev.clientY - eyePosition.clientY;
                const angle = Math.atan2(mouseOffsetY, mouseOffsetX);
                const len = Math.sqrt(mouseOffsetX ** 2 + mouseOffsetY ** 2);
                const c = Math.cos(angle);
                const s = Math.sin(angle);

                // 视线跟踪
                this.player.setVariableDiff('eyetrack', 'face_eye_LR', len / 3 * c, 500, -1);
                this.player.setVariableDiff('eyetrack', 'face_eye_UD', len / 3 * s, 500, -1);

                // 头部跟踪 - 当鼠标距离较远时
                if (len > 60) {
                    this.player.setVariableDiff('eyetrack', 'head_slant', len / 12 * c, 1000, -1);
                    this.player.setVariableDiff('eyetrack', 'head_LR', len / 6 * c, 1000, -1);
                    this.player.setVariableDiff('eyetrack', 'head_UD', len / 6 * s, 1000, -1);
                }

                // 身体跟踪 - 当鼠标距离很远时
                if (len > 120) {
                    this.player.setVariableDiff('eyetrack', 'body_slant', len / 18 * c, 2000, -1);
                    this.player.setVariableDiff('eyetrack', 'body_LR', len / 9 * c, 2000, -1);
                    this.player.setVariableDiff('eyetrack', 'body_UD', len / 9 * s, 2000, -1);
                }
            } catch (error) {
                console.warn('视线跟踪失败:', error);
            }
        };

        // 🎯 鼠标离开画布时重置视线
        const handleMouseLeave = () => {
            if (isTracking) {
                resetTimeout = setTimeout(resetEyeTracking, 500); // 500ms后重置
            }
        };

        // 🎯 鼠标进入画布时取消重置
        const handleMouseEnter = () => {
            if (resetTimeout) {
                clearTimeout(resetTimeout);
                resetTimeout = null;
            }
        };

        // 绑定鼠标移动事件
        this.canvas.onmousemove = eyeTrackingReaction;
        this.canvas.onmouseleave = handleMouseLeave;
        this.canvas.onmouseenter = handleMouseEnter;

        // 绑定移动端触摸移动事件
        this.canvas.addEventListener('touchmove', (ev) => {
            eyeTrackingReaction(ev.touches[0]);
            ev.preventDefault();
        }, false);

        // 🎯 移动端触摸结束时重置视线
        this.canvas.addEventListener('touchend', () => {
            if (isTracking) {
                resetTimeout = setTimeout(resetEyeTracking, 800); // 800ms后重置
            }
        }, false);

        // 🎯 初始化时重置视线到前方
        setTimeout(resetEyeTracking, 1000);
    }

    // 🎯 触摸交互功能 - 点击角色不同部位产生不同反应
    setupTouchReactions() {
        if (!this.player) return;

        let touching = false;

        const touchReaction = (ev) => {
            if (touching) return;

            try {
                const bustPosition = this.player.getMarkerPosition('bust');
                const eyePosition = this.player.getMarkerPosition('eye');

                if (!bustPosition || !eyePosition) return;

                const bustLength = Math.sqrt((bustPosition.clientX - ev.clientX) ** 2 + (bustPosition.clientY - ev.clientY) ** 2);
                const eyeLength = Math.sqrt((eyePosition.clientX - ev.clientX) ** 2 + (eyePosition.clientY - ev.clientY) ** 2);

                // 点击胸部区域 - 生气反应
                if (bustLength < 50) {
                    touching = true;
                    this.player.mainTimelineLabel = '怒る01';
                    this.player.diffTimelineSlot1 = 'びっくり2';
                    this.player.diffTimelineSlot2 = 'いやいや';
                    this.player.setVariable('arm_type', 2, 300);

                    setTimeout(() => {
                        touching = false;
                        this.player.mainTimelineLabel = CONFIG.defaultEmotion;
                        this.player.diffTimelineSlot1 = '';
                        this.player.diffTimelineSlot2 = '';
                        this.player.setVariable('arm_type', 0, 300);
                    }, 1500);
                }
                // 点击眼睛区域 - 困惑反应
                else if (eyeLength < 30) {
                    touching = true;
                    this.player.mainTimelineLabel = '困る00';
                    this.player.diffTimelineSlot1 = 'ひく';
                    this.player.setVariable('face_eye_open', 32);

                    setTimeout(() => {
                        touching = false;
                        this.player.mainTimelineLabel = CONFIG.defaultEmotion;
                        this.player.diffTimelineSlot1 = '';
                        this.player.setVariable('face_eye_open', 0);
                    }, 1000);
                }
            } catch (error) {
                console.warn('触摸交互失败:', error);
            }
        };

        // 绑定鼠标点击事件
        this.canvas.onclick = touchReaction;

        // 绑定移动端触摸事件
        this.canvas.addEventListener('touchstart', (ev) => {
            touchReaction(ev.touches[0]);
            ev.preventDefault();
        }, false);
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 创建应用实例
    window.characterViewer = new CharacterViewer();
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
        if (window.characterViewer) {
            window.characterViewer.resizeCanvas();
        }
    });
});

// 防止页面缩放
document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
});

document.addEventListener('gesturechange', (e) => {
    e.preventDefault();
});

document.addEventListener('gestureend', (e) => {
    e.preventDefault();
});
