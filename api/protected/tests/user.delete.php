<?php

$http = "http://bankapi.local/index.php/user/delete";
$req = curl_init();

curl_setopt($req, CURLOPT_POST, TRUE);
curl_setopt($req, CURLOPT_RETURNTRANSFER, TRUE);
curl_setopt($req, CURLOPT_URL, $http);
curl_setopt($req, CURLOPT_POSTFIELDS, array(
    "uid" => "1",
));

$res = curl_exec($req);

echo $res;

