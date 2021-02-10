<?php
define("SECRET", "secret");

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
    return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
}

class Token
{
    private string $token;
    private string $signature_encoded;
    private string $signature;
    private string $payload_encoded;
    private string $headers_encoded;
    private array $payload;
    private array $headers;

    function create($headers, $payload): string
    {
        //build the headers
        $this->headers = $headers;
        $this->headers_encoded = rtrim(base64url_encode(json_encode($this->headers)), "=");

        //build the payload
        $this->payload = $payload;
        $this->payload_encoded = rtrim(base64url_encode(json_encode($this->payload)), "=");

        //build the signature
        $this->signature = hash_hmac('sha256', "$this->headers_encoded.$this->payload_encoded", SECRET, true);
        $this->signature_encoded = rtrim(base64url_encode($this->signature), "=");

        //build and return the token
        $this->token = "$this->headers_encoded.$this->payload_encoded.$this->signature_encoded";
        return $this->token;
    }

    function import($token)
    {
        $this->token = $token;

        $tokenParts = explode('.', $token);

        $this->headers_encoded = $tokenParts[0];
        $this->payload_encoded = $tokenParts[1];
        $this->signature_encoded = $tokenParts[2];

        $this->headers = json_decode(base64url_decode($this->headers_encoded), true);
        $this->payload = json_decode(base64url_decode($this->payload_encoded), true);
        $this->signature = base64url_decode($this->payload_encoded);
    }

    function validate(): bool
    {
        $signature = hash_hmac('sha256', $this->headers_encoded . "." . $this->payload_encoded, SECRET, true);
        $signature_encoded = rtrim(base64url_encode($signature), "=");

        return $signature_encoded == $this->signature_encoded;
    }

    function get(): string
    {
        return $this->token;
    }
}