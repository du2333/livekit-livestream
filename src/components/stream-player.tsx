"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useCopyToClipboard } from "@/lib/clipboard";
import { type ParticipantMetadata, type RoomMetadata } from "@/lib/controller";
import { cn } from "@/lib/utils";
import {
  AudioTrack,
  StartAudio,
  VideoTrack,
  useDataChannel,
  useLocalParticipant,
  useMediaDeviceSelect,
  useParticipants,
  useRoomContext,
  useTracks,
} from "@livekit/components-react";
import {
  CheckIcon,
  CopyIcon,
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  EyeClosedIcon,
  EyeOpenIcon,
  PauseIcon,
  PlayIcon,
  SpeakerLoudIcon,
  SpeakerOffIcon,
  SpeakerQuietIcon,
} from "@radix-ui/react-icons";
import {
  Avatar,
  Badge,
  Flex,
  Grid,
  Button as RadixButton,
  Text,
} from "@radix-ui/themes";
import Confetti from "js-confetti";
import {
  ConnectionState,
  type LocalVideoTrack,
  Track,
  createLocalTracks,
} from "livekit-client";
import { useEffect, useRef, useState } from "react";
import { MediaDeviceSettings } from "./media-device-settings";
import { PresenceDialog } from "./presence-dialog";
import { useAuthToken } from "./token-context";

function ConfettiCanvas() {
  const [confetti, setConfetti] = useState<Confetti>();
  const [decoder] = useState(() => new TextDecoder());
  const canvasEl = useRef<HTMLCanvasElement>(null);

  // Use LiveKit's dataChannel for reactions
  useDataChannel("reactions", (data) => {
    if (!confetti) return;

    const options: { emojis?: string[]; confettiNumber?: number } = {};
    const payload = decoder.decode(data.payload);

    if (payload !== "🎉") {
      options.emojis = [payload];
      options.confettiNumber = 12;
    }

    void confetti.addConfetti(options);
  });

  useEffect(() => {
    if (canvasEl.current) {
      setConfetti(new Confetti({ canvas: canvasEl.current }));
    }
  }, []);

  return <canvas ref={canvasEl} className="absolute h-full w-full" />;
}

// 添加全屏API的接口定义
interface FullscreenDocument extends Document {
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
  webkitFullscreenElement?: Element;
  msFullscreenElement?: Element;
}

interface FullscreenElement extends HTMLDivElement {
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

export function StreamPlayer({ isHost = false }) {
  const [, copy] = useCopyToClipboard();
  const [isCopied, setIsCopied] = useState(false);
  const [volume, setVolume] = useState(100);
  const [previousVolume, setPreviousVolume] = useState(100);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const [localVideoTrack, setLocalVideoTrack] = useState<LocalVideoTrack>();
  const localVideoEl = useRef<HTMLVideoElement>(null);

  const { metadata, name: roomName, state: roomState } = useRoomContext();
  const roomMetadata = (metadata && JSON.parse(metadata)) as RoomMetadata;
  const { localParticipant } = useLocalParticipant();
  const localMetadata = (localParticipant.metadata &&
    JSON.parse(localParticipant.metadata)) as ParticipantMetadata;
  const canHost =
    isHost || (localMetadata?.invited_to_stage && localMetadata?.hand_raised);
  const participants = useParticipants();
  const showNotification = isHost
    ? participants.some((p) => {
        const metadata = (p.metadata &&
          JSON.parse(p.metadata)) as ParticipantMetadata;
        return metadata?.hand_raised && !metadata?.invited_to_stage;
      })
    : localMetadata?.invited_to_stage && !localMetadata?.hand_raised;

  // 进入/退出全屏
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      const element = containerRef.current as FullscreenElement;
      if (element.requestFullscreen) {
        void element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        void element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        void element.msRequestFullscreen();
      }
    } else {
      const doc = document as FullscreenDocument;
      if (doc.exitFullscreen) {
        void doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        void doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        void doc.msExitFullscreen();
      }
    }
  };

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as FullscreenDocument;
      setIsFullscreen(
        doc.fullscreenElement === containerRef.current ||
          doc.webkitFullscreenElement === containerRef.current ||
          doc.msFullscreenElement === containerRef.current
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  // 控制栏显示/隐藏逻辑
  const showControls = () => {
    setControlsVisible(true);

    // 清除现有的定时器
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
      setControlsTimeout(null);
    }

    // 设置新的定时器
    const timeout = setTimeout(() => {
      setControlsVisible(false);
    }, 3000); // 3秒后隐藏

    setControlsTimeout(timeout);
  };

  // 当鼠标悬停在控制栏上时，不要隐藏控制栏
  const handleControlsHover = () => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
      setControlsTimeout(null);
    }
  };

  // 当鼠标离开控制栏时，3秒后隐藏
  const handleControlsLeave = () => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }

    const timeout = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);

    setControlsTimeout(timeout);
  };

  // 移动设备触摸检测
  const handleTouchStart = () => {
    showControls();
  };

  // 当组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout]);

  // Get remote tracks using LiveKit hooks
  const remoteVideoTracks = useTracks([Track.Source.Camera]).filter(
    (t) => t.participant.identity !== localParticipant.identity
  );

  const remoteAudioTracks = useTracks([Track.Source.Microphone]).filter(
    (t) => t.participant.identity !== localParticipant.identity
  );

  // Initialize local track for hosting
  useEffect(() => {
    if (canHost) {
      const createTracks = async () => {
        const tracks = await createLocalTracks({ audio: true, video: true });
        const camTrack = tracks.find((t) => t.kind === Track.Kind.Video);
        if (camTrack && localVideoEl?.current) {
          camTrack.attach(localVideoEl.current);
        }
        setLocalVideoTrack(camTrack as LocalVideoTrack);
      };
      void createTracks();
    }
  }, [canHost]);

  // Camera device selection
  const { activeDeviceId: activeCameraDeviceId } = useMediaDeviceSelect({
    kind: "videoinput",
  });

  useEffect(() => {
    if (localVideoTrack) {
      void localVideoTrack.setDeviceId(activeCameraDeviceId);
    }
  }, [localVideoTrack, activeCameraDeviceId]);

  // Handle mute toggle
  const handleMuteToggle = () => {
    if (!muted) {
      // Store current volume before muting
      setPreviousVolume(volume);
      setVolume(0);
      setMuted(true);
    } else {
      // Restore to reasonable volume if previously muted
      if (volume === 0) {
        setVolume(previousVolume);
      }
      setMuted(false);
    }
  };

  // Handle volume slider change
  const handleVolumeChange = (newValue: number[]) => {
    const newVolume = newValue[0];
    setVolume(newVolume);

    // Update mute state based on volume
    if (newVolume === 0) {
      setMuted(true);
    } else if (muted) {
      setMuted(false);
    }
  };

  // Apply volume settings to audio elements
  useEffect(() => {
    // Update volume on all audio elements
    const audioElements = document.querySelectorAll("audio");
    audioElements.forEach((audioEl) => {
      audioEl.volume = volume / 100;
      audioEl.muted = muted;
    });
  }, [volume, muted]);

  // Pause/resume video playback
  useEffect(() => {
    const pauseResumeMedia = () => {
      // Handle all video elements
      const videoElements = document.querySelectorAll("video");
      videoElements.forEach((videoEl) => {
        if (paused && !videoEl.paused) {
          videoEl.pause();
        } else if (!paused && videoEl.paused && videoEl.readyState >= 2) {
          void videoEl.play().catch(() => {
            console.log("Video playback blocked by browser policy");
          });
        }
      });

      // Handle all audio elements
      const audioElements = document.querySelectorAll("audio");
      audioElements.forEach((audioEl) => {
        if (paused && !audioEl.paused) {
          audioEl.pause();
        } else if (!paused && audioEl.paused && audioEl.readyState >= 2) {
          void audioEl.play().catch(() => {
            console.log("Audio playback blocked by browser policy");
          });
        }
      });
    };

    pauseResumeMedia();
  }, [paused]);

  // Auth token for API calls
  const authToken = useAuthToken();
  const onLeaveStage = async () => {
    await fetch("/api/remove_from_stage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${authToken}`,
      },
      body: JSON.stringify({
        identity: localParticipant.identity,
      }),
    });
  };

  // Volume icon helper
  const VolumeIcon = () => {
    if (muted || volume === 0) return <SpeakerOffIcon className="h-4 w-4" />;
    if (volume < 30) return <SpeakerQuietIcon className="h-4 w-4" />;
    return <SpeakerLoudIcon className="h-4 w-4" />;
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full bg-black"
      onMouseMove={showControls}
      onTouchStart={handleTouchStart}
    >
      <div className="w-full h-full absolute">
        <Grid className="w-full h-full" gap="2">
          {canHost && (
            <div className="relative">
              <Flex
                className="absolute w-full h-full"
                align="center"
                justify="center"
              >
                <Avatar
                  size="9"
                  fallback={localParticipant.identity[0] ?? "?"}
                  radius="full"
                />
              </Flex>
              <video
                ref={localVideoEl}
                className="absolute w-full h-full object-contain -scale-x-100 bg-transparent"
              />
              <div className="absolute w-full h-full">
                <Badge
                  variant="outline"
                  color="gray"
                  className="absolute bottom-2 right-2"
                >
                  {localParticipant.identity} (you)
                </Badge>
              </div>
            </div>
          )}
          {remoteVideoTracks.map((t) => (
            <div key={t.participant.identity} className="relative">
              <Flex
                className="absolute w-full h-full"
                align="center"
                justify="center"
              >
                <Avatar
                  size="9"
                  fallback={t.participant.identity[0] ?? "?"}
                  radius="full"
                />
              </Flex>
              <div ref={videoContainerRef}>
                <VideoTrack
                  trackRef={t}
                  className="absolute w-full h-full bg-transparent"
                />
              </div>
              <div className="absolute w-full h-full">
                <Badge
                  variant="outline"
                  color="gray"
                  className="absolute bottom-2 right-2"
                >
                  {t.participant.identity}
                </Badge>
              </div>
            </div>
          ))}
        </Grid>
      </div>
      {remoteAudioTracks.map((t) => (
        <AudioTrack trackRef={t} key={t.participant.identity} />
      ))}
      <ConfettiCanvas />
      <StartAudio
        label="Click to allow audio playback"
        className="absolute top-0 h-full w-full bg-gray-2-translucent text-white"
      />

      {/* 顶部控件栏 - 始终可见 */}
      <div className="absolute top-0 w-full p-2 z-20">
        <Flex justify="between" align="end">
          <Flex gap="2" justify="center" align="center">
            <RadixButton
              size="1"
              variant="soft"
              disabled={!Boolean(roomName)}
              onClick={() => {
                void copy(
                  `${process.env.NEXT_PUBLIC_SITE_URL}/watch/${roomName}`
                );
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
              }}
            >
              {roomState === ConnectionState.Connected ? (
                <>
                  {roomName} {isCopied ? <CheckIcon /> : <CopyIcon />}
                </>
              ) : (
                "Loading..."
              )}
            </RadixButton>
            {roomName && canHost && (
              <Flex gap="2">
                <MediaDeviceSettings />
                {roomMetadata?.creator_identity !==
                  localParticipant.identity && (
                  <RadixButton size="1" onClick={() => void onLeaveStage()}>
                    Leave stage
                  </RadixButton>
                )}
              </Flex>
            )}
          </Flex>
          <Flex gap="2">
            {roomState === ConnectionState.Connected && (
              <Flex gap="1" align="center">
                <div className="rounded-6 bg-red-9 w-2 h-2 animate-pulse" />
                <Text size="1" className="uppercase text-accent-11">
                  Live
                </Text>
              </Flex>
            )}
            <PresenceDialog isHost={isHost}>
              <div className="relative">
                {showNotification && (
                  <div className="absolute flex h-3 w-3 -top-1 -right-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-6 bg-accent-11 opacity-75"></span>
                    <span className="relative inline-flex rounded-6 h-3 w-3 bg-accent-11"></span>
                  </div>
                )}
                <RadixButton
                  size="1"
                  variant="soft"
                  disabled={roomState !== ConnectionState.Connected}
                >
                  {roomState === ConnectionState.Connected ? (
                    <EyeOpenIcon />
                  ) : (
                    <EyeClosedIcon />
                  )}
                  {roomState === ConnectionState.Connected
                    ? participants.length
                    : ""}
                </RadixButton>
              </div>
            </PresenceDialog>
          </Flex>
        </Flex>
      </div>

      {/* 播放控制栏 - 条件显示 */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 p-2 bg-black/80 transition-opacity duration-300 z-20",
          controlsVisible ? "opacity-100" : "opacity-0"
        )}
        onMouseEnter={handleControlsHover}
        onMouseLeave={handleControlsLeave}
      >
        <div className="w-full flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPaused(!paused)}
            className="text-white hover:bg-white/10 shrink-0"
          >
            {paused ? (
              <PlayIcon className="h-4 w-4" />
            ) : (
              <PauseIcon className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleMuteToggle}
            className="text-white hover:bg-white/10 shrink-0"
          >
            <VolumeIcon />
          </Button>

          <div className="w-full flex-1 max-w-[180px]">
            <Slider
              value={[muted ? 0 : volume]}
              onValueChange={handleVolumeChange}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div className="flex-1"></div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white/10 shrink-0 ml-auto"
          >
            {isFullscreen ? (
              <ExitFullScreenIcon className="h-4 w-4" />
            ) : (
              <EnterFullScreenIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* 视频点击检测覆盖层 - 透明但可点击，排除控制栏区域 */}
      <div
        className="absolute inset-0 z-0"
        onClick={() => {
          showControls();
          // 移除自动恢复播放的逻辑，只显示控制栏
        }}
      />
    </div>
  );
}
