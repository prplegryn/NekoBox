// 配置文件 - 管理PSB文件列表和表情映射

const CONFIG = {
    // PSB文件列表 - 根据你的实际文件修改
    characterFiles: [
        'data/choco.psb',
        // 添加更多PSB文件
        // 'data/character2.psb',
        // 'data/character3.psb',
    ],
    
    // 表情动作映射 - 根据实际PSB文件中的标签调整
    emotions: [
        '平常', '怒る01', '困る00', 'びっくり2', 'いやいや', 'ひく'
    ],
    
    // 表情映射 - 如果PSB文件中的标签与显示名称不同，可以在这里映射
    emotionMapping: {
        '平常': '平常',
        '怒る01': '生气',
        '困る00': '困惑',
        'びっくり2': '惊讶',
        'いやいや': '摇头',
        'ひく': '退缩'
    },
    
    // 🎯 默认缩放设置 - 修改这里的数值来改变人物默认大小
    // 数值范围：0.1-3.0，数值越大人物越大
    defaultScale: 1.0,
    defaultEmotion: '平常',
    
    // 🎯 缩放范围设置 - 修改这里的数值来改变缩放滑块的范围
    scaleRange: {
        min: 0.1,    // 最小缩放值
        max: 3.0,    // 最大缩放值
        step: 0.1    // 缩放步长
    },
    
    // 角色名称映射 - 如果文件名与显示名称不同
    characterNames: {
        'choco.psb': '巧克力',
        // 'character2.psb': '角色2',
        // 'character3.psb': '角色3',
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
