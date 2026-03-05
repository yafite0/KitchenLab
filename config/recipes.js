// =============================================================================
// 菜品配方数据
// =============================================================================

const RECIPES = [
    {
        id: 'scrambledEgg',
        emoji: '🍳🍅',
        main: [
            { ingId: 'tomato', target: 200 },
            { ingId: 'egg', target: 150 }
        ],
        saltRange: [0.01, 0.02],
        basePriceCN: 18,      // 人民币价格，游戏内自动×10
        storyCN: '将蛋液如金丝般注入沸水，配以细碎的红果粒，熬成一碗浓醇的汤羹。'
    },
    {
        id: 'pastaBolognese',
        emoji: '🍝🥩',
        main: [
            { ingId: 'flour', target: 150 },
            { ingId: 'tomato', target: 200 },
            { ingId: 'beef', target: 150 }
        ],
        saltRange: [0.012, 0.022],
        basePriceCN: 38,
        storyCN: '星象师们观测到绯红之星后创造的庆典食物，面条如星轨般缠绕。'
    },
    {
        id: 'tempura',
        emoji: '🍤✨',
        main: [
            { ingId: 'shrimp', target: 120 },
            { ingId: 'flour', target: 80 },
            { ingId: 'egg', target: 50 }
        ],
        saltRange: [0.008, 0.015],
        basePriceCN: 45,
        storyCN: '将海产与地鲜裹上金衣，在滚油中瞬间定格，外酥内嫩。'
    },
    {
        id: 'taco',
        emoji: '🌮🌶️',
        main: [
            { ingId: 'corn', target: 100 },
            { ingId: 'beef', target: 150 },
            { ingId: 'tomato', target: 80 }
        ],
        saltRange: [0.015, 0.025],
        basePriceCN: 28,
        storyCN: '玉米薄饼包裹着调味肉末与鲜蔬，是太阳神赐予的便携美食。'
    },
    {
        id: 'curry',
        emoji: '🍛🐔',
        main: [
            { ingId: 'chicken', target: 200 },
            { ingId: 'potato', target: 150 },
            { ingId: 'onion', target: 100 }
        ],
        saltRange: [0.012, 0.02],
        basePriceCN: 42,
        storyCN: '鸡肉在姜黄与孜然的怀抱中慢慢炖煮，每一丝肉都浸透太阳的香气。'
    },
    {
        id: 'onionSoup',
        emoji: '🧅🥣',
        main: [
            { ingId: 'onion', target: 300 },
            { ingId: 'cheese', target: 50 }
        ],
        saltRange: [0.01, 0.018],
        basePriceCN: 35,
        storyCN: '洋葱慢慢炒出焦糖色，融入高汤，表面覆着熔化的奶酪。'
    },
    {
        id: 'greekSalad',
        emoji: '🥗🧀',
        main: [
            { ingId: 'cucumber', target: 150 },
            { ingId: 'tomato', target: 150 },
            { ingId: 'cheese', target: 80 }
        ],
        saltRange: [0.008, 0.015],
        basePriceCN: 32,
        storyCN: '新鲜蔬菜与羊奶酪的相遇，浇上橄榄油，是奥林匹斯山下的夏日记忆。'
    },
    {
        id: 'bibimbap',
        emoji: '🍚🥕',
        main: [
            { ingId: 'rice', target: 200 },
            { ingId: 'beef', target: 100 },
            { ingId: 'egg', target: 50 }
        ],
        saltRange: [0.01, 0.018],
        basePriceCN: 38,
        storyCN: '五色蔬菜围绕在米饭周围，拌入辣酱，是调和天地五行的完美一餐。'
    },
    {
        id: 'padThai',
        emoji: '🍜🌶️',
        main: [
            { ingId: 'riceNoodle', target: 200 },
            { ingId: 'shrimp', target: 100 },
            { ingId: 'egg', target: 80 }
        ],
        saltRange: [0.015, 0.025],
        basePriceCN: 40,
        storyCN: '河粉如湄南河的彩带，与虾仁、豆芽在热锅中翻飞，酸甜辣咸平衡。'
    },
    {
        id: 'burger',
        emoji: '🍔🥬',
        main: [
            { ingId: 'flour', target: 150 },
            { ingId: 'beef', target: 200 },
            { ingId: 'tomato', target: 50 }
        ],
        saltRange: [0.01, 0.02],
        basePriceCN: 30,
        storyCN: '两片芝麻面包夹着多汁肉饼，是快餐文化的世界征服者。'
    }
];