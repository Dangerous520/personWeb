"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import * as THREE from "three"
import { Button } from "@/components/ui/button"
import NeonText from "@/components/neon-text"

// 定义俄罗斯方块形状
const SHAPES = [
  // I形
  {
    shape: [[1, 1, 1, 1]],
    color: "#00F3FF",
  },
  // L形
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "#FF00FF",
  },
  // J形
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "#00FF9D",
  },
  // O形
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#FFE600",
  },
  // S形
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "#FF00FF",
  },
  // Z形
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "#00FF9D",
  },
  // T形
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "#00F3FF",
  },
]

// 游戏常量
const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const INITIAL_SPEED = 1000 // 初始下落速度（毫秒）

// 预先创建几何体和材质，避免重复创建
const blockGeometry = new THREE.BoxGeometry(0.9, 0.9, 0.9)
const edgesGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.9, 0.9, 0.9))
const lineBasicMaterial = new THREE.LineBasicMaterial({ color: "#ffffff", linewidth: 2 })
const boardEdgesGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(BOARD_WIDTH, BOARD_HEIGHT, 1))
const boardLineBasicMaterial = new THREE.LineBasicMaterial({ color: "#00F3FF", linewidth: 2 })

// 定义类型
interface PieceType {
  shape: number[][];
  color: string;
}

interface PositionType {
  x: number;
  y: number;
}

// 创建材质缓存
const materialCache: Record<string, THREE.MeshPhysicalMaterial> = {}

// 获取或创建材质
const getMaterial = (color: string): THREE.MeshPhysicalMaterial => {
  if (!materialCache[color]) {
    materialCache[color] = new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.9,
      transmission: 0.2,
      clearcoat: 1,
    })
  }
  return materialCache[color]
}

// 优化的3D方块组件
const Block = ({ position, color }: { position: [number, number, number]; color: string }) => {
  const material = useMemo(() => getMaterial(color), [color])

  return (
    <group position={position}>
      <mesh geometry={blockGeometry} material={material} />
      <lineSegments geometry={edgesGeometry} material={lineBasicMaterial} />
    </group>
  )
}

// 修改 Text 组件
const TextElement = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => {
  return (
    <Text {...props} font={undefined}>
      {children}
    </Text>
  )
}

// 优化的游戏板组件
const GameBoard = ({ board, gameOver }: { board: (string | 0)[][]; gameOver: boolean }) => {
  // 使用useMemo减少不必要的重新计算
  const blocks = useMemo(() => {
    const blockElements: JSX.Element[] = []

    board.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          // 直接使用坐标，无需翻转
          blockElements.push(<Block key={`${x}-${y}`} position={[x, y, 0]} color={cell as string} />)
        }
      })
    })

    return blockElements
  }, [board])

  return (
    <group position={[-BOARD_WIDTH / 2 + 0.5, -BOARD_HEIGHT / 2 + 0.5, 0]}>
      {blocks}

      {/* 游戏边框 */}
      <lineSegments
        position={[BOARD_WIDTH / 2 - 0.5, BOARD_HEIGHT / 2 - 0.5, 0]}
        geometry={boardEdgesGeometry}
        material={boardLineBasicMaterial}
      />

      {gameOver && (
        <group position={[BOARD_WIDTH / 2 - 0.5, BOARD_HEIGHT / 2 - 0.5, 1]}>
          <TextElement
            position={[0, 0, 0.5]}
            fontSize={1.5}
            color="#FF00FF"
            anchorX="center"
            anchorY="middle"
          >
            GAME OVER
          </TextElement>
        </group>
      )}
    </group>
  )
}

// 优化的下一个方块预览
const NextPiecePreview = ({ nextPiece }: { nextPiece: PieceType | null }) => {
  if (!nextPiece) return null

  const { shape, color } = nextPiece
  const width = shape[0].length
  const height = shape.length

  // 使用useMemo减少不必要的重新计算
  const blocks = useMemo(() => {
    const blockElements: JSX.Element[] = []

    shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          blockElements.push(<Block key={`next-${x}-${y}`} position={[x, y, 0]} color={color} />)
        }
      })
    })

    return blockElements
  }, [shape, color])

  return (
    <group position={[BOARD_WIDTH / 2 + 3, BOARD_HEIGHT / 2 - 3, 0]}>
      <TextElement
        position={[0, 2, 0]}
        fontSize={0.8}
        color="#00F3FF"
        anchorX="center"
        anchorY="middle"
      >
        NEXT
      </TextElement>

      <group position={[-width / 2 + 0.5, -height / 2 + 0.5, 0]}>{blocks}</group>
    </group>
  )
}

// 分数显示
const ScoreDisplay = ({ score, level }: { score: number; level: number }) => {
  return (
    <group position={[BOARD_WIDTH / 2 + 3, BOARD_HEIGHT / 2 - 8, 0]}>
      <TextElement
        position={[0, 0, 0]}
        fontSize={0.8}
        color="#00F3FF"
        anchorX="center"
        anchorY="middle"
      >
        SCORE
      </TextElement>
      <TextElement
        position={[0, -1.2, 0]}
        fontSize={1}
        color="#FFE600"
        anchorX="center"
        anchorY="middle"
      >
        {score}
      </TextElement>

      <TextElement
        position={[0, -3, 0]}
        fontSize={0.8}
        color="#00F3FF"
        anchorX="center"
        anchorY="middle"
      >
        LEVEL
      </TextElement>
      <TextElement
        position={[0, -4.2, 0]}
        fontSize={1}
        color="#FF00FF"
        anchorX="center"
        anchorY="middle"
      >
        {level}
      </TextElement>
    </group>
  )
}

// 添加排行榜类型定义
interface LeaderboardEntry {
  playerName: string;
  score: number;
  level: number;
  lines: number;
  date: string;
}

// 后端API基础URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// 主游戏组件
export default function TetrisGame() {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [board, setBoard] = useState(() => createEmptyBoard())
  const [currentPiece, setCurrentPiece] = useState(null)
  const [nextPiece, setNextPiece] = useState(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  const [lines, setLines] = useState(0)
  const dropTimerRef = useRef(null)
  const lastDropTimeRef = useRef(0)
  const gameContainerRef = useRef(null)
  const requestRef = useRef(null)
  const audioCache = useRef({})
  const [currentPieceShape, setCurrentPieceShape] = useState(null)
  const [playerName, setPlayerName] = useState("")
  const [isSubmittingScore, setIsSubmittingScore] = useState(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [isOfflineMode, setIsOfflineMode] = useState(false)

  // 创建空游戏板
  function createEmptyBoard() {
    return Array(BOARD_HEIGHT)
      .fill()
      .map(() => Array(BOARD_WIDTH).fill(0))
  }

  // 修改音频播放功能，使用空对象代替实际音频
  const playSound = useCallback((soundName) => {
    // 不执行任何操作，只是记录日志
    console.log(`播放音效: ${soundName}（已禁用）`)
  }, [])

  // 生成随机方块
  const getRandomPiece = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * SHAPES.length)
    return SHAPES[randomIndex]
  }, [])

  // 检查碰撞
  const checkCollision = useCallback(
    (shape, pos) => {
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const boardX = pos.x + x
            const boardY = pos.y + y

            // 检查边界
            if (
              boardX < 0 ||
              boardX >= BOARD_WIDTH ||
              boardY < 0 ||
              boardY >= BOARD_HEIGHT ||
              // 检查已有方块
              (boardY >= 0 && board[boardY][boardX])
            ) {
              return true
            }
          }
        }
      }
      return false
    },
    [board],
  )

  // 旋转方块
  const rotatePiece = useCallback((piece) => {
    const { shape, color } = piece
    const newShape = []

    // 转置矩阵
    for (let x = 0; x < shape[0].length; x++) {
      const newRow = []
      for (let y = shape.length - 1; y >= 0; y--) {
        newRow.push(shape[y][x])
      }
      newShape.push(newRow)
    }

    return { shape: newShape, color }
  }, [])

  // 渲染游戏板和当前方块
  const renderBoard = useCallback(() => {
    // 创建一个临时游戏板的副本
    const tempBoard = board.map((row) => [...row])

    // 将当前方块添加到临时游戏板
    if (currentPiece) {
      const { shape, color } = currentPiece

      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const boardY = position.y + y
            const boardX = position.x + x

            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              tempBoard[boardY][boardX] = color
            }
          }
        }
      }
    }

    return tempBoard
  }, [board, currentPiece, position])

  // 合并方块到游戏板
  const mergePieceToBoard = useCallback(() => {
    if (!currentPiece) return

    setBoard((prevBoard) => {
      const newBoard = prevBoard.map((row) => [...row])
      const { shape, color } = currentPiece

      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const boardY = position.y + y
            const boardX = position.x + x

            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              newBoard[boardY][boardX] = color
            }
          }
        }
      }

      return newBoard
    })
  }, [currentPiece, position])

  // 清除完整的行
  const clearLines = useCallback(() => {
    let linesCleared = 0;

    setBoard(prevBoard => {
      const newBoard = [...prevBoard];
      
      // 从底部往上检查行
      for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (newBoard[y].every(cell => cell !== 0)) {
          // 删除该行
          newBoard.splice(y, 1);
          // 在顶部添加新行
          newBoard.unshift(Array(BOARD_WIDTH).fill(0));
          linesCleared++;
        }
      }
      
      // 如果有行被清除，更新分数和等级
      if (linesCleared > 0) {
        // 在setState外存储清除的行数，以便后续使用
        setTimeout(() => {
          // 计算分数
          const linePoints = [0, 40, 100, 300, 1200]; // 0, 1, 2, 3, 4行的分数
          
          // 使用函数式更新确保获取最新状态
          setScore(prevScore => {
            // 在回调中获取最新的level
            const currentLevel = level;
            const points = linePoints[Math.min(linesCleared, 4)] * currentLevel;
            console.log(`清除${linesCleared}行，等级${currentLevel}，得分+${points}`);
            return prevScore + points;
          });
          
          // 更新总行数并检查等级
          setLines(prevLines => {
            const newLines = prevLines + linesCleared;
            
            // 计算应该的等级
            const newLevel = Math.floor(newLines / 10) + 1;
            
            // 如果等级应该提升，则更新等级和速度
            if (newLevel > level) {
              console.log(`升级：${level} -> ${newLevel}`);
              setLevel(newLevel);
              setSpeed(INITIAL_SPEED / newLevel);
            }
            
            return newLines;
          });
        }, 0);
      }
      
      return newBoard;
    });
    
    if (linesCleared > 0) {
      playSound("clear");
    }
  }, [level, playSound]);

  // 生成新方块
  const spawnNewPiece = useCallback(() => {
    let newPiece;
    if (nextPiece) {
      newPiece = nextPiece;
      setNextPiece(getRandomPiece());
    } else {
      newPiece = getRandomPiece();
      setNextPiece(getRandomPiece());
    }

    setCurrentPiece(newPiece);
    setCurrentPieceShape(newPiece?.shape);

    // 将新方块放在顶部中间
    const newX = Math.floor((BOARD_WIDTH - (newPiece?.shape[0]?.length || 0)) / 2);
    const newY = 0; // 顶部
    setPosition({ x: newX, y: newY });

    // 检查游戏是否结束 - 如果新方块一出现就碰撞，则游戏结束
    if (newPiece && checkCollision(newPiece.shape, { x: newX, y: newY })) {
      console.log("游戏结束!");
      setGameOver(true);
      playSound("gameover");
    }
  }, [checkCollision, getRandomPiece, nextPiece, playSound]);

  // 移动方块
  const movePiece = useCallback(
    (dx, dy) => {
      if (!currentPiece || gameOver) return;

      const newPos = { x: position.x + dx, y: position.y + dy };

      if (!checkCollision(currentPiece.shape, newPos)) {
        setPosition(newPos);
        return true;
      }

      // 如果是向下移动并且发生碰撞，则固定方块
      if (dy > 0) { // 下移是y增加
        mergePieceToBoard();
        clearLines();
        spawnNewPiece();
      }

      return false;
    },
    [checkCollision, clearLines, currentPiece, gameOver, mergePieceToBoard, position, spawnNewPiece]
  );

  // 旋转当前方块
  const rotate = useCallback(() => {
    if (!currentPiece || gameOver) return

    const rotatedPiece = rotatePiece(currentPiece)

    // 检查旋转后是否会碰撞
    if (!checkCollision(rotatedPiece.shape, position)) {
      // 播放旋转音效
      playSound("rotate")

      setCurrentPiece(rotatedPiece)
    }
  }, [checkCollision, currentPiece, gameOver, position, playSound, rotatePiece])

  // 快速下落
  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver) return;

    let newY = position.y;
    // 找到可以下落的最远位置
    while (!checkCollision(currentPiece.shape, { x: position.x, y: newY + 1 })) {
      newY++;
    }

    setPosition(prev => ({ ...prev, y: newY }));
    mergePieceToBoard();
    clearLines();
    spawnNewPiece();

    playSound("drop");
  }, [checkCollision, clearLines, currentPiece, gameOver, mergePieceToBoard, playSound, position, spawnNewPiece]);

  // 游戏循环
  const gameLoop = useCallback((timestamp) => {
    try {
      if (!gameStarted || gameOver) {
        requestRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const elapsed = timestamp - lastDropTimeRef.current;

      if (elapsed > speed) {
        // 自动下落 - 向下移动是Y坐标增加
        movePiece(0, 1);
        lastDropTimeRef.current = timestamp;
      }

      requestRef.current = requestAnimationFrame(gameLoop);
    } catch (error) {
      console.error("游戏循环错误:", error);
      requestRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameStarted, gameOver, movePiece, speed]);

  // 开始游戏
  const startGame = useCallback(() => {
    try {
      console.log("开始游戏...");
      
      // 重置游戏状态
      setBoard(createEmptyBoard());
      setScore(0);
      setLevel(1);
      setLines(0);
      setSpeed(INITIAL_SPEED);
      setGameOver(false);

      // 创建初始方块
      const firstPiece = getRandomPiece();
      const secondPiece = getRandomPiece();
      
      console.log("生成初始方块");
      setCurrentPiece(firstPiece);
      setNextPiece(secondPiece);
      
      // 设置初始位置在顶部中间
      const newX = Math.floor((BOARD_WIDTH - firstPiece.shape[0].length) / 2);
      setPosition({ x: newX, y: 0 });

      // 开始游戏循环
      lastDropTimeRef.current = performance.now();
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      requestRef.current = requestAnimationFrame(gameLoop);

      setGameStarted(true);
      setCurrentPieceShape(firstPiece.shape);
      
      console.log("游戏成功启动!");
    } catch (error) {
      console.error("游戏启动失败:", error);
      alert("游戏启动失败，请查看控制台获取详细信息。");
    }
  }, [gameLoop, getRandomPiece]);

  // 修改键盘控制
  const handleKeyDown = useCallback((e) => {
    try {
      console.log("键盘按键:", e.key);
      
      // 阻止方向键和空格键的默认行为
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }
      
      if (!gameStarted || gameOver) {
        console.log("游戏未开始或已结束，忽略按键");
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
          console.log("向左移动");
          movePiece(-1, 0);
          break;
        case "ArrowRight":
          console.log("向右移动");
          movePiece(1, 0);
          break;
        case "ArrowDown":
          console.log("向下移动");
          // 向下移动是Y坐标增加
          movePiece(0, 1);
          break;
        case "ArrowUp":
          console.log("旋转方块");
          rotate();
          break;
        case " ": // 空格键
          console.log("快速下落");
          hardDrop();
          break;
        default:
          console.log("未处理的按键:", e.key);
          break;
      }
    } catch (error) {
      console.error("处理按键事件错误:", error);
    }
  }, [gameOver, gameStarted, hardDrop, movePiece, rotate]);

  // 设置和清理游戏循环
  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [gameLoop])

  // 修改预加载音频文件的useEffect
  useEffect(() => {
    console.log("音频已禁用，跳过音频预加载")
  }, [])

  // 使用useMemo缓存渲染的游戏板
  const memoizedBoard = useMemo(() => renderBoard(), [renderBoard])

  // 添加调试信息
  useEffect(() => {
    console.log("游戏状态:", {
      gameStarted,
      gameOver,
      currentPiece,
      nextPiece,
      position,
      score,
      level,
      speed
    })
  }, [gameStarted, gameOver, currentPiece, nextPiece, position, score, level, speed])

  // 添加一个useEffect，确保游戏开始后聚焦游戏容器
  useEffect(() => {
    if (gameStarted && gameContainerRef.current) {
      // 延迟一些时间以确保组件已渲染
      const timeoutId = setTimeout(() => {
        if (gameContainerRef.current) {
          console.log("聚焦游戏容器")
          try {
            gameContainerRef.current.focus()
          } catch (error) {
            console.error("无法聚焦游戏容器:", error)
          }
        }
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [gameStarted])

  // 添加全局键盘事件监听器，防止方向键滚动页面
  useEffect(() => {
    const preventArrowScroll = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        // 仅当处于游戏区域时阻止默认滚动
        const activeSectionElement = document.getElementById("tetris")
        if (activeSectionElement && activeSectionElement.contains(document.activeElement)) {
          e.preventDefault()
        }
      }
    }

    window.addEventListener("keydown", preventArrowScroll)
    return () => {
      window.removeEventListener("keydown", preventArrowScroll)
    }
  }, [])

  // 检查后端连接状态
  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3秒超时
        
        const response = await fetch(`${API_BASE_URL}/health`, {
          signal: controller.signal
        }).catch(() => null);
        
        clearTimeout(timeoutId);
        
        if (!response || !response.ok) {
          console.log("后端不可用，切换到离线模式");
          setIsOfflineMode(true);
          // 从本地存储加载排行榜
          loadLocalLeaderboard();
        }
      } catch (error) {
        console.log("检查后端连接失败，切换到离线模式", error);
        setIsOfflineMode(true);
        // 从本地存储加载排行榜
        loadLocalLeaderboard();
      }
    };
    
    checkBackendConnection();
  }, []);

  // 从本地存储加载排行榜
  const loadLocalLeaderboard = useCallback(() => {
    try {
      const localLeaderboard = JSON.parse(localStorage.getItem('tetrisLeaderboard') || '[]');
      if (Array.isArray(localLeaderboard) && localLeaderboard.length > 0) {
        // 按分数排序
        localLeaderboard.sort((a, b) => b.score - a.score);
        setLeaderboard(localLeaderboard.slice(0, 10)); // 只取前10名
      }
    } catch (error) {
      console.error("加载本地排行榜失败:", error);
    }
  }, []);

  // 添加从后端获取排行榜数据的函数
  const fetchLeaderboard = useCallback(async () => {
    if (isOfflineMode) {
      loadLocalLeaderboard();
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/tetris/scores?limit=10`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setLeaderboard(data.data)
        } else {
          console.error('获取排行榜失败:', data.message)
        }
      } else {
        console.error('获取排行榜请求失败:', response.statusText)
        // 请求失败时切换到离线模式并加载本地数据
        setIsOfflineMode(true)
        loadLocalLeaderboard()
      }
    } catch (error) {
      console.error('获取排行榜出错:', error)
      // 出错时切换到离线模式并加载本地数据
      setIsOfflineMode(true)
      loadLocalLeaderboard()
    }
  }, [isOfflineMode, loadLocalLeaderboard])

  // 模拟后端响应（离线模式使用）
  const simulateScoreSubmission = (scoreData: any) => {
    return new Promise(resolve => {
      setTimeout(() => {
        // 保存到本地存储
        try {
          const localLeaderboard = JSON.parse(localStorage.getItem('tetrisLeaderboard') || '[]');
          localLeaderboard.push({
            ...scoreData,
            id: `offline-${Date.now()}`
          });
          
          // 按分数排序
          localLeaderboard.sort((a, b) => b.score - a.score);
          
          localStorage.setItem('tetrisLeaderboard', JSON.stringify(localLeaderboard));
          
          // 更新当前排行榜
          loadLocalLeaderboard();
        } catch (error) {
          console.error("保存到本地存储失败", error);
        }
        
        resolve({
          success: true,
          message: "分数已成功保存（离线模式）",
          data: {
            id: `offline-${Date.now()}`,
            ...scoreData
          }
        });
      }, 1000);
    });
  };

  // 添加将分数提交到后端的函数
  const submitScore = useCallback(async () => {
    if (!playerName || isSubmittingScore) return
    
    setIsSubmittingScore(true)
    try {
      const scoreData = {
        playerName,
        score,
        level,
        lines,
        date: new Date().toISOString()
      }
      
      let result;
      
      if (isOfflineMode) {
        // 离线模式：保存到本地
        result = await simulateScoreSubmission(scoreData) as any;
        console.log('离线模式：分数已保存到本地');
      } else {
        // 在线模式：发送到后端
        try {
          const response = await fetch(`${API_BASE_URL}/tetris/scores`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(scoreData)
          });
          
          if (response.ok) {
            result = await response.json();
          } else {
            throw new Error(`提交分数失败 (${response.status})`);
          }
        } catch (fetchError) {
          console.error("API请求失败，切换到离线模式", fetchError);
          // 请求失败时切换到离线模式
          setIsOfflineMode(true);
          result = await simulateScoreSubmission(scoreData) as any;
        }
      }
      
      if (result.success) {
        console.log('分数提交成功!');
        // 刷新排行榜
        fetchLeaderboard();
        // 显示排行榜
        setShowLeaderboard(true);
      } else {
        console.error('提交分数失败:', result.message);
      }
    } catch (error) {
      console.error('提交分数出错:', error);
    } finally {
      setIsSubmittingScore(false);
    }
  }, [playerName, score, level, lines, isSubmittingScore, fetchLeaderboard, isOfflineMode, loadLocalLeaderboard]);

  // 加载排行榜，在组件挂载时调用
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <div className="w-full py-20" id="tetris">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="inline-block text-3xl font-bold relative">
            <NeonText text="赛博俄罗斯方块" color="#00F3FF" />
            <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-[#FF00FF] to-[#00FF9D]"></span>
          </h2>
          <p className="text-gray-300 mt-4 font-mono">使用方向键控制，空格键快速下落</p>
        </div>

        {/* 游戏和排行榜并排布局 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 游戏区域 - 占据2/3空间 */}
          <div className="md:col-span-2">
        <div
          ref={gameContainerRef}
          className="relative w-full aspect-[4/3] bg-black/60 backdrop-blur-sm border border-[#00F3FF]/30 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#00F3FF]"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          style={{ touchAction: "none" }} /* 防止移动设备上的默认触摸行为 */
        >
          {!gameStarted && !gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <h3 className="text-[#00FF9D] text-3xl font-bold mb-8 font-['ZiHun59']">准备开始</h3>
              <Button
                onClick={startGame}
                    className="bg-gradient-to-r from-[#FF00FF] to-[#00FF9D] text-white border-none hover:opacity-90 text-xl px-8 py-6 font-['ZiHun59']"
              >
                开始游戏
              </Button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/70">
              <h3 className="text-[#FF00FF] text-3xl font-bold mb-4">游戏结束</h3>
                  {isOfflineMode && (
                    <div className="text-yellow-400 text-sm mb-2">[离线模式 - 分数将保存到本地]</div>
                  )}
              <p className="text-white text-xl mb-2">得分: {score}</p>
              <p className="text-white text-xl mb-2">行数: {lines}</p>
              <p className="text-white text-xl mb-8">等级: {level}</p>
                  
                  <div className="mb-4 w-64">
                    <input 
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="输入您的名字"
                      className="w-full p-2 bg-black/60 border border-[#00F3FF] text-white rounded-md font-['ZiHun59']"
                    />
                  </div>
                  <Button
                    onClick={submitScore}
                    disabled={!playerName || isSubmittingScore}
                    className="bg-gradient-to-r from-[#FF00FF] to-[#00FF9D] text-white border-none hover:opacity-90 font-['ZiHun59'] w-64 mb-4"
                  >
                    {isSubmittingScore ? '提交中...' : '提交分数'}
                  </Button>
              <Button
                onClick={startGame}
                    className="bg-gradient-to-r from-[#FF00FF] to-[#00FF9D] text-white border-none hover:opacity-90 font-['ZiHun59'] w-64"
              >
                再来一局
              </Button>
            </div>
          )}

          <Canvas
            camera={{ position: [0, 0, 25], fov: 50 }}
                gl={{ antialias: false }}
                dpr={[1, 1.5]}
                performance={{ min: 0.5 }}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />

            <GameBoard board={memoizedBoard} gameOver={gameOver} />
            {nextPiece && <NextPiecePreview nextPiece={nextPiece} />}
            <ScoreDisplay score={score} level={level} />

            <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
          </Canvas>
        </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-black/60 backdrop-blur-sm border border-[#00F3FF]/30 rounded-lg p-4">
                <h3 className="text-[#00FF9D] font-bold mb-2 font-['ZiHun59']">控制说明</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>← → : 左右移动</li>
              <li>↓ : 加速下落</li>
              <li>↑ : 旋转方块</li>
              <li>空格 : 快速下落</li>
            </ul>
          </div>

          <div className="bg-black/60 backdrop-blur-sm border border-[#00F3FF]/30 rounded-lg p-4">
                <h3 className="text-[#00FF9D] font-bold mb-2 font-['ZiHun59']">得分规则</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>消除1行: 40 × 等级</li>
              <li>消除2行: 100 × 等级</li>
              <li>消除3行: 300 × 等级</li>
              <li>消除4行: 1200 × 等级</li>
            </ul>
          </div>

          <div className="bg-black/60 backdrop-blur-sm border border-[#00F3FF]/30 rounded-lg p-4">
                <h3 className="text-[#00FF9D] font-bold mb-2 font-['ZiHun59']">当前数据</h3>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li>得分: {score}</li>
                  <li>等级: {level}</li>
                  <li>行数: {lines}</li>
                  <li>状态: {gameOver ? "游戏结束" : gameStarted ? "游戏中" : "就绪"}</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* 排行榜区域 - 占据1/3空间 */}
          <div className="bg-black/60 backdrop-blur-sm border border-[#00F3FF]/30 rounded-lg p-4 flex flex-col">
            <h3 className="text-[#00FF9D] text-xl font-bold mb-4 text-center font-['ZiHun59']">
              排行榜 {isOfflineMode && <span className="text-xs text-yellow-400">[本地]</span>}
            </h3>
            
            {leaderboard.length > 0 ? (
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[#00F3FF] border-b border-[#00F3FF]/30">
                      <th className="text-left py-2">名次</th>
                      <th className="text-left">玩家</th>
                      <th className="text-right">分数</th>
                      <th className="text-right">等级</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => (
                      <tr 
                        key={index} 
                        className={`border-b border-gray-800 ${entry.playerName === playerName ? 'text-[#FF00FF]' : 'text-white'}`}
                      >
                        <td className="py-2">{index + 1}</td>
                        <td className="truncate max-w-[100px]">{entry.playerName}</td>
                        <td className="text-right">{entry.score}</td>
                        <td className="text-right">{entry.level}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                暂无排行榜数据
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-[#00F3FF]/30">
              <p className="text-gray-300 text-xs text-center">
                {isOfflineMode 
                  ? "离线模式 - 数据保存在本地" 
                  : "在线模式 - 数据保存到服务器"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

