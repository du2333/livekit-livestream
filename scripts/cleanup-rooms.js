/**
 * 清理脚本 - 用于删除所有LiveKit房间
 * 
 * 使用方法: 
 * 1. 确保已配置 .env 文件
 * 2. 使用 node scripts/cleanup-rooms.js 运行
 */

const { RoomServiceClient } = require('livekit-server-sdk');
require('dotenv').config({ path: '.env' });

async function main() {
    if (!process.env.LIVEKIT_WS_URL || !process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
        console.error('请先配置环境变量: LIVEKIT_WS_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET');
        process.exit(1);
    }

    const httpUrl = process.env.LIVEKIT_WS_URL.replace("wss://", "https://").replace("ws://", "http://");
    const roomService = new RoomServiceClient(
        httpUrl,
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET
    );

    try {
        // 获取所有房间
        console.log('获取所有房间...');
        const rooms = await roomService.listRooms();

        if (rooms.length === 0) {
            console.log('没有找到任何房间');
            return;
        }

        console.log(`找到 ${rooms.length} 个房间:`);
        rooms.forEach(room => {
            let metadata = {};
            try {
                if (room.metadata) {
                    metadata = JSON.parse(room.metadata);
                }
            } catch (e) { }

            console.log(`- ${room.name} (创建者: ${metadata.creator_identity || '未知'}, 参与者: ${room.numParticipants})`);
        });

        // 确认删除
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        readline.question(`确定要删除以上所有房间吗? (y/N) `, async (answer) => {
            if (answer.toLowerCase() === 'y') {
                console.log('正在删除房间...');
                let deletedCount = 0;

                for (const room of rooms) {
                    try {
                        await roomService.deleteRoom(room.name);
                        console.log(`✓ 成功删除房间: ${room.name}`);
                        deletedCount++;
                    } catch (error) {
                        console.error(`✗ 删除房间失败 (${room.name}): ${error.message}`);
                    }
                }

                console.log(`\n操作完成，已删除 ${deletedCount}/${rooms.length} 个房间`);
            } else {
                console.log('操作已取消');
            }

            readline.close();
        });

    } catch (error) {
        console.error('操作失败:', error.message);
        process.exit(1);
    }
}

main().catch(console.error); 