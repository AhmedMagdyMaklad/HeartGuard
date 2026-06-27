import os
import urllib.request
import re

screens = [
    {
        "id": "1",
        "name": "Risk Report with Realigned Metrics",
        "image": "https://lh3.googleusercontent.com/aida/ADBb0ujW-csB3WfytjERnOKmKKFmU9J-9tobRbMg7E2COZ7KDRhjrLfbGJrm_RxArlcA1qN1xPNB0LNCrFR1_icX-upIfyxa38bCNyk-flWivjVRJLjilsipyKUccmwRNLJ2ay0xdtpv1zUuXjN0Q8ZAgTRwjtHaC7etSm12xSuq8cPSYUYprh9PWifiah33my2OV4aV2SdGRFvoLTJPPDRIFIGAnysuz7NkVQw5RobpJyUwW8o-f4nS_v-IpbM",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY0Y2NiZjZjMTI2ZjAwNGU3NGFhYjk3MDJkMTY3EgsSBxCXiNLUlw8YAZIBIwoKcHJvamVjdF9pZBIVQhM4MTg0MTI1OTIwMTMyNjA5MTM1&filename=&opi=89354086"
    },
    {
        "id": "2",
        "name": "Dashboard with ECG Classification",
        "image": "https://lh3.googleusercontent.com/aida/ADBb0ug5ov2PvKKqRpkGwmCXWQrGqyuYzL8Lsqhn-Y9RV3Pohb78XHFRRaZC2UOVUkSvaKSJ6sw1RndlWJhpNllvUsN-wNje7Vw20rjbD2KOJnrmHPjnVrs7RIq7HohS0YMkS4kNJXvnnB4JjSlZHawGTxGWXw-LiD-S4PjYKXvv2GT8rwhHx0rBDtvKprJIskLqkce8znQvFutdv1htvgSw9_2WH66ocCGlL-sASYZS0xARz3mPZbJsjRiTqYc",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY0Y2NiYzFjMTkyMDUwMjNiZTk0NDI3MjliMTliEgsSBxCXiNLUlw8YAZIBIwoKcHJvamVjdF9pZBIVQhM4MTg0MTI1OTIwMTMyNjA5MTM1&filename=&opi=89354086"
    },
    {
        "id": "3",
        "name": "Risk Assessment - Step 1: Vitals",
        "image": "https://lh3.googleusercontent.com/aida/ADBb0uhu2O3zIO5dFN-C8KWIiR88FRoNQ8xZ-4u2B2bRyXL-xJO0dySpsNPq7hNNwiNLhpml-5jz8n0OSLsB6gTE-mgwks4jSZuKtbg4A7poSsTaVpwsLq3fF6XlV6EqoHaWw36DxEyY889ilmbbgYyGKXOC-Ib-j0WTkYLWp5gCKm9j2uAuTbjI87kiQXEGPeIQbOWkuewLj3SzBc3u5_0z2s_LqUFFIEkDgBaPdEoHf8EnDr6x357KBkFKxdI",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2NkZjJhMjc1YzM2ODRkNWNhMDY0YTc1Mzc1M2ZjODk4EgsSBxCXiNLUlw8YAZIBIwoKcHJvamVjdF9pZBIVQhM4MTg0MTI1OTIwMTMyNjA5MTM1&filename=&opi=89354086"
    },
    {
        "id": "4",
        "name": "Risk Assessment - Step 2: ECG Upload",
        "image": "https://lh3.googleusercontent.com/aida/ADBb0ujA7EVax47z_uZEqe1hGicUDbXlgA4JRzyVRb6yQCJm5h80J97Q3FAOB2aZWORwnqM1kzpaaf-L1z9w0pnttM9ISQSX-nA_3LlVmRcL_9GfMm37O8essa9rYhjwIwnGvzS6iQHcYBZPD6-0Vvdzw9mUMyy4gjW8QNmmlQhjv9YEqrwgs8P8FVOPpQ6oZD7RcouwA_rIAMSs2jkyBUN5U-JFQCPjmogV-QUmphynwMhbl0gGAQ74YnA-YTE",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzMwMmJjOWRiYzUyZDQ2NTJhY2NhZWNkZjU2MDJiY2QxEgsSBxCXiNLUlw8YAZIBIwoKcHJvamVjdF9pZBIVQhM4MTg0MTI1OTIwMTMyNjA5MTM1&filename=&opi=89354086"
    },
    {
        "id": "5",
        "name": "Onboarding: Medical History",
        "image": "https://lh3.googleusercontent.com/aida/ADBb0uit8vSMsL3sBgX5z2T0FpsjUNhPSgoT605E3T9HnilySawoWZGMR7SlF23McUgXgk4b1fPkzRfGf-z4i8ubEljP1e1tGOSvGn5yggY4kefVPLR70AkIj8sjSCQfo_crxk2eyPUuBme55k2A2pp0sLc18_vdf70tu2iX3430m4Aszq-i84XN4SsKFcD5WDU5-aG3sA4IibuAOTLLgOKp1zfY-aSHzGbDUdw_9oUrRQa0PLt_NzOMllLUy3E",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2MyYzdkMzFjZjc4MTQ5MDlhOWUyMzM5MWU3YjE4NDA0EgsSBxCXiNLUlw8YAZIBIwoKcHJvamVjdF9pZBIVQhM4MTg0MTI1OTIwMTMyNjA5MTM1&filename=&opi=89354086"
    },
    {
        "id": "6",
        "name": "Updated Onboarding: Basic Info",
        "image": "https://lh3.googleusercontent.com/aida/ADBb0uj46pQITIcJvt7jJrI7FzUhJVRP46sHOrGeULfM2dJFQUgJAATohWZajBU5JVPAyJBK_96FodxpB5InbiFEMNVArYLEEVwvjh3lC3LgCnomMQdlzWTl6hAdfORF7VngifCtgQrhnsW2bRkNWuoF6WbOK1Fh-saj1cdZDYz9vt1xQOaY9hR0EIoXc2_Yi6eLiB5MaaDHlSM8Fyf5szKYwXYf9nk-iDXFBvHKSZoIYDEyc6_Jx_W8AT5dOA",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzY3NTMzMGMzZTc0ZTQ5NmFiOTY5ZGM3MTdjMzdlZmU5EgsSBxCXiNLUlw8YAZIBIwoKcHJvamVjdF9pZBIVQhM4MTg0MTI1OTIwMTMyNjA5MTM1&filename=&opi=89354086"
    },
    {
        "id": "7",
        "name": "Onboarding: Lifestyle",
        "image": "https://lh3.googleusercontent.com/aida/ADBb0uhLP73dwCw_nPX4MTfO7_Fq_f2qbJ5lVFdQJ_xsu5htAUouWmu3uvoZgBmC5ISm-vgRbyh5eqFmwj0MzDWmmSRzTeyWRNeNlr_sHp6vcjcRhSZUxbjCto-WAkzm3v6ZJI68iMl3bZoCx-fwOMoxfGpErD33kgw76a0rG0f3zxsarhzQ8W-eR3d2ozYy28eBh9I20ZTP7XWKDEgqt_9ReVTB9iu3vtBb0383qlUsk4YA4gQ302DD-4nWa58",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2JhODM1OGNhN2JiZjRiNzA4Y2RmYzc3YzEzYWI4MWY4EgsSBxCXiNLUlw8YAZIBIwoKcHJvamVjdF9pZBIVQhM4MTg0MTI1OTIwMTMyNjA5MTM1&filename=&opi=89354086"
    },
    {
        "id": "8",
        "name": "Updated HeartGuard Landing Page",
        "image": "https://lh3.googleusercontent.com/aida/ADBb0uh0lu3MHX9muxAbi9mCpCtDVtRCvjmYzVPyb5mrTUCcWic44J0R0euCOQzNsh8CfwmQaM6-_Z024rVVJ1nj8n__h-oruV-irfcd1r5rJdCYLq58Hxt9KhAFyD05qEEyyoOyzweMfSe1FcbcftlszmqnajNEM2avuOoYG3cX8VJg1tnRjiAHl5no9AKt-CLj9QSbN48dgdDwpIO69HJIi1CtyFzla38CFutyc47dgA9Imk592IyFmBvkYvA",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY0YzY1YjI3OWRmZWIwMjNiYzRhOTkwMGQwZGY2EgsSBxCXiNLUlw8YAZIBIwoKcHJvamVjdF9pZBIVQhM4MTg0MTI1OTIwMTMyNjA5MTM1&filename=&opi=89354086"
    },
    {
        "id": "9",
        "name": "First-Time User Dashboard (No Data)",
        "image": "https://lh3.googleusercontent.com/aida/AOfcidXO7Q_PFTIKg2xeKh67m-_aFLuJlpggGkXIrSuEIzjjarmCLn4ckydLjeeQn3TYx-bnLvp_sc05XGyIdyFxd5wty4dy92kjmt463heAmVYAdBgXGhc6GygpqV3oHS7r4SBkbKGm0bzUrv0OiWcsTqDtFzArNuyWCkMDQX4ft3za3uayLha4yOa6L-tB8b3vUgbMMqDT5tQnAyaGgO5zyF9PdYWwhP9qdj3zaFtK6C9-Dloi7hV1ZdaMh3I",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzQ4MWExMDkzNmEyZDRlOTdhMDNkZjI2ZTIwY2E5YTU0EgsSBxCXiNLUlw8YAZIBIwoKcHJvamVjdF9pZBIVQhM4MTg0MTI1OTIwMTMyNjA5MTM1&filename=&opi=89354086"
    },
    {
        "id": "10",
        "name": "Updated HeartGuard Sign Up Page",
        "image": "https://lh3.googleusercontent.com/aida/ADBb0ujFnzk2SRffUsUQZSrqIH_gUV1tP4h4sMMCin48h82GATKLZzVCBiU5dqRUefOWyUpo4CAPnhr-9Ytpml8f0n6arVQ-VRWTk-ZV8svKsD_mf01Jw1sxdlsJSPgHMA-o6VVGfDgs0pYHHyTu_f9n_FrjFFQPzwfAZ2_pnX8oTe-pcn-sumdqazA8vvfOza4ARkKYqqg0_N6ayNeygSKc-D7KiXyzmWH8b9LEgtnzpy4xZBYpNH1qc4JG6Co",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzgyNmFhYTNhNjMyMzQxNjg5ZWEyZTg5ODdhYjJiY2EzEgsSBxCXiNLUlw8YAZIBIwoKcHJvamVjdF9pZBIVQhM4MTg0MTI1OTIwMTMyNjA5MTM1&filename=&opi=89354086"
    },
    {
        "id": "11",
        "name": "HeartGuard Login Page",
        "image": "https://lh3.googleusercontent.com/aida/ADBb0ugu_2IlFeKjmQgbtMWkBXeVGgcD882dvkwFn-Q5Su01AGHJ7iqQQg_NwJok9evUYYUux63uWpkK7HVTksn-_Bn7fL5EAe7w_i77aJIfJ5QQKVmTu_7-3EJQAKKREms-25Vz4RNWkov7tv8nVj1gMWgTV8_wzw1z9ZUORfSdfHrRxWXy7_Ap5mHe2YIhEGwGqzbusD7HiAZL7K_wMPL7qNwmzPur7iEwPGqc4Y7tdGkG0CFkf-Z7AUCs6A",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzJlM2U5N2E2ZDkzZjRlM2ZiMDIzYThlOGU0YjIzOGY1EgsSBxCXiNLUlw8YAZIBIwoKcHJvamVjdF9pZBIVQhM4MTg0MTI1OTIwMTMyNjA5MTM1&filename=&opi=89354086"
    },
    {
        "id": "12",
        "name": "AI Chatbot with Dashboard Navigation",
        "image": "https://lh3.googleusercontent.com/aida/ADBb0ui_VL8m7NGLlWTnpcXYyz1FDBAzD5-Ve3S8YGGhJFyDfgveYJSuR94PlvFvuWWyJGQzBKLfut6LsuTdhZh2Mnw3io4aqulNMaJX9hx1fxom6jhmbslmhHeCKcoJeGx40w2JdRIwTqrKmMxdAJp1FW0sWmVL9EJfYQytAqTHG1uQFMam0d0Tyn_SWJqGHRgcPd_Axo2P4oVa2xLk7h7jsYq06-pseHu24vXoP6IAokdS6lhE2sK1c0tXSok",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzljOGI3NTNhMWE0NzRhYTU4MzU3YmFhMzBlYWFjN2M3EgsSBxCXiNLUlw8YAZIBIwoKcHJvamVjdF9pZBIVQhM4MTg0MTI1OTIwMTMyNjA5MTM1&filename=&opi=89354086"
    },
    {
        "id": "13",
        "name": "Welcome Onboarding Screen",
        "image": "https://lh3.googleusercontent.com/aida/ADBb0ujcT2ESgWOjyCafProFNpeymki9ueKfaatCJhGBWpJkQDySy4F4w7VxgBuqbW3vbm8VQ8Goyokz5U9VgnrlM0veXGF_lpTCQIsG5xZ5GBd2mVaB6ZApw7bw8qL8Q2yeNDkC0byk5jmRyH7sFfveqql1LgsDeC_J4IPbROU_Wt0xCCShT1pb-q7jd35_ZL_MLdAhlihHUcR57gJzKl0wabRiYl9OeeVQmvqMpfeDAEWBnaf9O53r0ZxHQA",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzFjZGI0OGNmOTg3NTQ3OTE5NTY3MWU3Mjc4ODUzMWE4EgsSBxCXiNLUlw8YAZIBIwoKcHJvamVjdF9pZBIVQhM4MTg0MTI1OTIwMTMyNjA5MTM1&filename=&opi=89354086"
    }
]

def sanitize_filename(name):
    return re.sub(r'[\\/*?:"<>|]', "", name).strip()

def download(url, filename):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response, open(filename, 'wb') as out_file:
            out_file.write(response.read())
        print(f"Downloaded {filename}")
    except Exception as e:
        print(f"Failed to download {filename}: {e}")

base_dir = r"d:\Bussiness\AI Projects\HeartGuard\screens"
os.makedirs(base_dir, exist_ok=True)

for screen in screens:
    s_id = screen['id']
    name = sanitize_filename(screen['name'])
    
    html_filename = os.path.join(base_dir, f"{s_id}_{name}.html")
    image_filename = os.path.join(base_dir, f"{s_id}_{name}.png")
    
    download(screen['html'], html_filename)
    download(screen['image'], image_filename)

print("Done downloading all screens.")
