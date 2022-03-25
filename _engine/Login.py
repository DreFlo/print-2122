import mechanize as mc
from bs4 import BeautifulSoup as bs
import os
import Core

cookieFilename = "cookies.txt"

class Login:
    def __init__(self):
        self.br = mc.Browser()
        self.cj = None          # variable to store cookies
        self.htmlPage = None    # variable to store the html of login

        self.initCookie()
        self.checkLogin()

    def initCookie(self):
        self.cj = mc.LWPCookieJar()
        self.br.set_cookiejar(self.cj)

        # check if cookies file exist
        if os.path.isfile(cookieFilename):
            self.cj.revert(cookieFilename, True, True)

    def checkLogin(self):
        htmlSigarra = Core.get_html(self.br, "https://sigarra.up.pt/feup/pt/web_page.inicial")
        soup = bs(htmlSigarra).find("form", {"action": "vld_validacao.sair"})

        if soup is not None:
            self.htmlPage = htmlSigarra

    def getNameLogin(self):
        return str(bs(self.htmlPage).find("a", {"class": "nomelogin"}).text)

    def authenticate(self, username, password):
        if self.htmlPage is None:
            self.br.select_form(nr=0)
            self.br["p_user"] = username
            self.br["p_pass"] = password

            # submission of the form
            response2 = self.br.submit()

            self.cj.save(cookieFilename, True, True)
            self.htmlPage = response2

    def logout(self):
        if os.path.exists("../cookies.txt"):
            os.remove("../cookies.txt")

    def getBr(self):
        return self.br