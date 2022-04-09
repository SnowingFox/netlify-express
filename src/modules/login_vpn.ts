import * as CryptoJS from 'crypto-js'
import { Axios, AxiosError } from 'axios'
import { createInstance } from '../shared/service/base'

const headers = { cookie: '' }

const url1 = 'https://webvpn.hfut.edu.cn/http/77726476706e69737468656265737421f3f652d22f367d44300d8db9d6562d/cas/login?service=https%3A%2F%2Fwebvpn.hfut.edu.cn%2Flogin%3Fcas_login%3Dtrue'
const url2 = 'https://webvpn.hfut.edu.cn/wengine-vpn/input'
const url3 = 'https://webvpn.hfut.edu.cn/http/77726476706e69737468656265737421f3f652d22f367d44300d8db9d6562d/cas/checkInitVercode?vpn-12-o1-cas.hfut.edu.cn='
const url4 = 'https://webvpn.hfut.edu.cn/wengine-vpn/cookie?method=get&host=cas.hfut.edu.cn&scheme=http&path=/cas/login'

const instance = createInstance({ withCredentials: true, maxRedirects: 0 })

const baseUrl = 'https://webvpn.hfut.edu.cn/https'

function encryptionPwd(pwd: string, salt: string) {
  let secretKey = salt
  let key = CryptoJS.enc.Utf8.parse(secretKey)
  let password = CryptoJS.enc.Utf8.parse(pwd)
  let encrypted = CryptoJS.AES.encrypt(password, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 })
  let encryptedPwd = encrypted.toString()
  return encryptedPwd
}

export async function loginVpn() {
  const time = Date.now()

  const res1 = await instance.get(url1, { headers })
  res1.headers['set-cookie']?.forEach(cookie => headers.cookie += `${cookie}; `)

  await instance.get(url2, { headers, params: { type: 'text', name: 'username', value: '2021217986' }, maxRedirects: 1 })

  await instance.get(url3, { headers, params: { _: time } })
  const res4 = await instance.get(url4, { headers, params: { vpn_timestamp: time } })
  const key = res4.data.split('; ')[1].split('=')[1]
  const pwd = encryptionPwd('Ai200212243614', key)
  const url5 = `https://webvpn.hfut.edu.cn/http/77726476706e69737468656265737421f3f652d22f367d44300d8db9d6562d/cas/policy/checkUserIdenty?vpn-12-o1-cas.hfut.edu.cn=&username=2021217986&password=${pwd}&_=${time}`
  const res5 = await instance.get(url5, { headers })

  const url6 = 'https://webvpn.hfut.edu.cn/https/77726476706e69737468656265737421f3f652d22f367d44300d8db9d6562d/cas/login?service=https%3A%2F%2Fcas.hfut.edu.cn%2Fcas%2Foauth2.0%2FcallbackAuthorize%3Fclient_id%3DBsHfutEduPortal%26redirect_uri%3Dhttps%253A%252F%252Fone.hfut.edu.cn%252Fhome%252Findex%26response_type%3Dcode%26client_name%3DCasOAuthClient'
  let ticketRedirect = baseUrl
  try {
    await instance.get(url6, {
      headers,
      maxRedirects: 0,
      params: {
        username: '2021217986',
        capcha: '',
        execution: 'e1s1',
        _eventId: 'submit',
        password: pwd,
        geolocation: '',
      },
    })
  } catch (err) {
    ticketRedirect = (err as AxiosError).response!.headers.location
  }

  await instance.get('https://webvpn.hfut.edu.cn/wengine-vpn/cookie?method=get&host=cas.hfut.edu.cn&scheme=http&path=/cas/login&vpn_timestamp=1649513091453', { headers, maxRedirects: 0 })

  let tokenDirect = baseUrl

  try {
    await instance.get(ticketRedirect, {
      headers,
      maxRedirects: 0,
    })
  } catch (err) {
    tokenDirect += (err as AxiosError).response!.headers.location
  }

  console.log(tokenDirect)

  let tokenDirect2 = baseUrl

  try {
    await instance.get(tokenDirect, {
      headers,
      maxRedirects: 0,
    })
  } catch (err) {
    tokenDirect2 += (err as AxiosError).response!.headers.location
  }

  console.log(tokenDirect2)

  let tokenDirect3 = ''

  try {
    await instance.get(tokenDirect2, {
      headers,
      maxRedirects: 0,
    })
  } catch (err) {
    tokenDirect3 += (err as AxiosError).response!.headers.location
  }

  console.log(tokenDirect3)

  const loginRes = await instance.get(tokenDirect3, { headers })
  console.log(loginRes.data)

  // try {
  //   const auth = await instance.get('https://cas.hfut.edu.cn/cas/oauth2.0/authorize?response_type=code&client_id=BsHfutEduPortal&redirect_uri=https://one.hfut.edu.cn/', { headers })
  // } catch (err) {
  //   console.log((err as AxiosError).response!.headers.location)
  // }
}
