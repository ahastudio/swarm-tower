export const HOUSE_X = 2200;
export const HOUSE_Y = 1400;
export const HOUSE_MAX_HP = 100;
export const MAX_LEVEL = 5;
// 본부 레벨 n -> n+1에 드는 동전은 UPGRADE_COST[n]
export const UPGRADE_COST = [0, 60, 120, 200, 300];
export const UPGRADE_PAD = { x: HOUSE_X + 80, y: HOUSE_Y + 110 };
export const HOUSE_HIT_RANGE = 70;

// 울타리 조각의 양 끝 기둥 중심 사이 길이. 층 그림 17칸이다
export const FENCE_STEP = 37.4;

export const MAP_WIDTH = 4500;
export const MAP_HEIGHT = 2800;
export const MAP_MARGIN = 300;
export const ISLAND = {
  centerX: 2200,
  centerY: 1400,
  radiusX: 2050,
  radiusY: 1250,
};

// 섬이 바다 위로 솟은 높이와 섬 옆면 층 하나의 높이(월드 px)
export const ISLAND_ELEVATION = 22;
export const SIDE_LAYER_STEP = 2;

// 연못: [중심 x, 중심 y, 가로 반지름, 세로 반지름]
const POND_OFFSETS = [
  [-1000, 70, 190, 110],
  [1100, 70, 230, 130],
  [-1000, 760, 170, 90],
  [950, 760, 200, 110],
  [400, -700, 190, 90],
  [-1300, -600, 200, 100],
  [1500, -300, 180, 100],
];
export const PONDS = POND_OFFSETS.map(([deltaX, deltaY, radiusX, radiusY]) => [
  HOUSE_X + deltaX,
  HOUSE_Y + deltaY,
  radiusX,
  radiusY,
]);
// 연못 구덩이 깊이(월드 px)
export const POND_DEPTH = 12;

// 땅의 높낮이: 연속 값을 문턱값으로 잘라 층(level)을 나눈다
export const LEVEL_THRESHOLDS = [0.36, 0.52, 1.0, 1.4, 1.8, 2.2];
export const LEVEL_COUNT = LEVEL_THRESHOLDS.length;
export const HEIGHT_CELL = 20;
// 이만큼 이상 층 차이가 나면 벽이다
export const WALL_LEVELS = 3;
// 언덕 한 층의 높이(월드 px)
export const LEVEL_HEIGHT = 10;

// 타워를 지을 곳: 본부 레벨마다 열리는 [dx, dy, 동전] 세 곳씩
const SPOT_LAYOUT = [
  [
    [-170, 330, 15],
    [0, 400, 15],
    [170, 330, 15],
  ],
  [
    [-340, 420, 30],
    [340, 420, 30],
    [0, 500, 30],
  ],
  [
    [-480, 330, 50],
    [480, 330, 50],
    [0, 580, 50],
  ],
  [
    [-560, 130, 80],
    [560, 130, 80],
    [-420, 560, 80],
  ],
  [
    [-600, -120, 110],
    [600, -120, 110],
    [420, 560, 110],
  ],
];
export const SPOT_GROUPS = SPOT_LAYOUT.map((group) =>
  group.map(([deltaX, deltaY, cost]) => [
    Math.round(HOUSE_X + deltaX),
    Math.round(HOUSE_Y + deltaY),
    cost,
  ]),
);
export const ALL_SPOTS = SPOT_GROUPS.flat();
export const MAX_PELLETS = 2500;
// 타워를 짓는 판은 한 변 88의 정사각형이다
export const SPOT_HALF = 44;

// 타워 최고 레벨과 레벨을 올리는 데 드는 동전
export const TOWER_MAX_LEVEL = 5;
export const TOWER_UPGRADE_COST = [20, 40, 80, 160];

export const START = { x: HOUSE_X + 20, y: HOUSE_Y + 270 };
export const CAMERA_START = { rotation: 0.6, tilt: 0.68, zoom: 1 };
export const WORKER_RANGE = 320;
export const WORKER_RATE = 0.35;
export const WORKER_BLAST = 40;
export const WORKER_FLIGHT = 0.32;

export const ENEMY_SPRITES = [
  'chick',
  'pig',
  'bunny',
  'cat',
  'dog',
  'caterpillar',
  'cow',
];
// 웨이브 사이에 새 적이 나오지 않고 쉬는 시간(초)
export const BREAK_SECONDS = 25;

export const FLOW_CELL = 30;
export const FLOW_COLUMNS = Math.ceil(MAP_WIDTH / FLOW_CELL);
export const FLOW_ROWS = Math.ceil(MAP_HEIGHT / FLOW_CELL);

// 카메라: 줌과 높낮이(tilt)가 움직일 수 있는 범위
export const MIN_ZOOM = 0.35;
export const MAX_ZOOM = 3;
export const MIN_TILT = 0.35;
export const MAX_TILT = 1;
// 손가락이나 마우스가 위아래로 1px 움직일 때 바뀌는 tilt
export const TILT_PER_PIXEL = 0.003;

// 캔버스 ellipse와 arc의 끝 각도. 2π보다 크면 한 바퀴 전체를 그린다
export const FULL_ARC = 7;

// 여러 그림 코드가 함께 쓰는 색
export const OUTLINE_COLOR = '#2a2340';
export const COIN_GOLD_COLOR = '#ffc531';
export const LABEL_YELLOW_COLOR = '#ffe14d';
export const COIN_BROWN_COLOR = '#8a5a12';
export const LABEL_CREAM_COLOR = '#fff8e8';
export const SEA_COLOR = '#4db6e6';
export const COIN_HIGHLIGHT_COLOR = '#ffe680';
export const SOIL_COLOR = '#b08350';
export const HINT_BLUE_COLOR = '#2d6fb8';
export const UPGRADE_BLUE_COLOR = '#6fb6ff';
