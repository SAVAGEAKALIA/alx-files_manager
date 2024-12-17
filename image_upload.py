import base64
import requests
import sys
import os


# path = r'C:\Users\DAddy Hubbub\pictures\image.png' # for windows
path = "/mnt/c/Users/DAddy Hubbub/pictures"
file_path = os.path.join (path, sys.argv[1])
# print(file_path)
file_name = file_path.split('/')[-1]
# print(file_name)
#file_path = os.path.join(path)
# file_size = os.path.getsize(file_path)
# print(f"File size: {file_size} bytes")
# print(file_path)
# file_name = file_path.split('/')[-1]

file_encoded = None
with open(file_path, "rb") as image_file:
    file_encoded = base64.b64encode(image_file.read()).decode('utf-8')

r_json = { 'name': file_name, 'type': 'image', 'isPublic': True, 'data': file_encoded, 'parentId': sys.argv[3] }
r_headers = { 'X-Token': sys.argv[2] }

r = requests.post("http://0.0.0.0:5000/files", json=r_json, headers=r_headers)
# print("Status Code:", r.status_code)
# print("Response Text:", r.text)
print(r.json())
