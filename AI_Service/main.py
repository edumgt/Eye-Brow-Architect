import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File
import uvicorn
import io
import os
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

app = FastAPI()

# MediaPipe Face Landmarker 설정
model_path = 'face_landmarker.task'
BaseOptions = mp.tasks.BaseOptions
FaceLandmarker = mp.tasks.vision.FaceLandmarker
FaceLandmarkerOptions = mp.tasks.vision.FaceLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

options = FaceLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=model_path),
    running_mode=VisionRunningMode.IMAGE)

landmarker = FaceLandmarker.create_from_options(options)

def get_eyebrow_points(landmarks):
    # anatomical Left (Observer's Right)
    left_indices = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46]
    # anatomical Right (Observer's Left)
    right_indices = [336, 296, 334, 293, 300, 276, 283, 282, 295, 285]
    
    left_eyebrow = [{"x": landmarks[i].x, "y": landmarks[i].y} for i in left_indices]
    right_eyebrow = [{"x": landmarks[i].x, "y": landmarks[i].y} for i in right_indices]
    
    return left_eyebrow, right_eyebrow

def get_eyeliner_points(landmarks):
    # MediaPipe indices for the upper eyelid (anatomical Left/Right)
    # Left eye: [33, 161, 160, 159, 158, 157, 173, 133]
    # Right eye: [263, 388, 387, 386, 385, 384, 398, 362]
    left_eye_indices = [33, 161, 160, 159, 158, 157, 173, 133]
    right_eye_indices = [263, 388, 387, 386, 385, 384, 398, 362]
    
    left_eyeliner = [{"x": landmarks[i].x, "y": landmarks[i].y} for i in left_eye_indices]
    right_eyeliner = [{"x": landmarks[i].x, "y": landmarks[i].y} for i in right_eye_indices]
    
    return left_eyeliner, right_eyeliner

def calculate_face_shape_refined(landmarks):
    top = landmarks[10]
    bottom = landmarks[152]
    left_cheek = landmarks[234]
    right_cheek = landmarks[454]
    
    height = bottom.y - top.y
    width = right_cheek.x - left_cheek.x
    
    if width <= 0: return "계란형"
    ratio = height / width
    
    # 얼굴형 한글화 매핑
    if ratio > 1.35: return "긴 얼굴형"
    elif ratio < 1.1: return "둥근 얼굴형"
    else: return "계란형"

def get_face_outline(landmarks):
    # MediaPipe Face Oval indices (silhouette)
    oval_indices = [
        10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 
        378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 127, 162, 21, 54, 103, 67, 109
    ]
    outline = [{"x": landmarks[i].x, "y": landmarks[i].y} for i in oval_indices]
    return outline

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    print(f"--- New Analysis Request ---")
    print(f"File: {file.filename}, Content-Type: {file.content_type}")
    try:
        contents = await file.read()
        print(f"Read {len(contents)} bytes")
        
        if len(contents) == 0:
            return {"error": "Empty file received"}

        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            print("Failed to decode image as CV2")
            return {"error": "Invalid image format"}

        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_image)
        
        detection_result = landmarker.detect(mp_image)
        
        if not detection_result.face_landmarks:
            print("No face detected by MediaPipe")
            return {
                "faceShape": "인식 실패", 
                "eyebrowCoords": {"left":[], "right":[]},
                "faceOutline": [],
                "recommendation": "얼굴을 인식하지 못했습니다. 정면 사진을 다시 시도해 주세요."
            }
            
        landmarks = detection_result.face_landmarks[0]
        face_shape = calculate_face_shape_refined(landmarks)
        left_eyebrow, right_eyebrow = get_eyebrow_points(landmarks)
        left_eyeliner, right_eyeliner = get_eyeliner_points(landmarks)
        face_outline = get_face_outline(landmarks)
        
        print(f"Analysis successful: Shape={face_shape}")
        return {
            "faceShape": face_shape,
            "eyebrowCoords": {
                "left": left_eyebrow,
                "right": right_eyebrow
            },
            "eyelinerCoords": {
                "left": left_eyeliner,
                "right": right_eyeliner
            },
            "faceOutline": face_outline,
            "recommendation": f"당신은 매력적인 {face_shape}입니다. 이에 최적화된 눈썹 및 아이라인 가이드를 추천합니다."
        }
    except Exception as e:
        import traceback
        print(f"CRITICAL ERROR during analysis: {e}")
        traceback.print_exc()
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
