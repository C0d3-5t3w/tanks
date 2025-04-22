package main

import (
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/C0d3-5t3w/myT00L5/fmtExt"
)

func main() {
	fs := http.FileServer(http.Dir("."))
	var Addr string
	fmtExt.BoxPrint("Welcome!")
	fmt.Println("Type an address to serve from (E.g. 127.0.0.1:8080):")
	fmt.Scanln(&Addr)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		path := filepath.Clean(r.URL.Path)
		if path == "/" {
			http.ServeFile(w, r, "index.html")
			return
		}
		if strings.HasPrefix(path, "/tabs/") {
			http.ServeFile(w, r, path[1:])
			return
		}
		fs.ServeHTTP(w, r)
	})
	fmt.Println("Serving on", Addr)
	http.ListenAndServe(Addr, nil)
	err := http.ListenAndServe(Addr, nil)
	if err != nil {
		log.Fatal("Server failed to start: ", err)
	}
}
