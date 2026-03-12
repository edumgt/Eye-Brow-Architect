import json

def lambda_handler(event, context):
    # Lex V2 이벤트 구조에서 인텐트 이름 추출
    intent_name = event['sessionState']['intent']['name']
    
    # 응답 메시지 설정
    response_text = "나혜님의 아이브로우 분석을 완료했습니다!"
    
    # Lex V2에서 대화를 종료하고 'Fulfilled' 상태로 전송
    return {
        "sessionState": {
            "dialogAction": {
                "type": "Close"
            },
            "intent": {
                "name": intent_name,
                "state": "Fulfilled"
            }
        },
        "messages": [
            {
                "contentType": "PlainText",
                "content": response_text
            }
        ]
    }
