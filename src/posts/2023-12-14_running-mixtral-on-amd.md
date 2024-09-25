---
title: Running Mixtral 8x7B LLM on a single 7900 XTX
date: '2023-12-14'
draft: false
tags: [ai, rocm]
oldUrl: /ai/2023/12/14/running-mixtral-on-amd
---
The newly announced model by [Mistral AI](https://mistral.ai/news/mixtral-of-experts/){target="_blank"} can show some really great results, let's see how we can run it locally!

<!--more-->

[Llama.cpp](https://github.com/ggerganov/llama.cpp){target="_blank"} is a great software, it enables us to run any LLM on the edge, meaning any model can run on your laptop.

Although some large models requires high computational costs, Mistral has showed us small models can be fast and qualitative.
Mixtral is their latest and bestest models of all, the Llama.cpp team has recently merged [a pull request that adds Mixtral support](https://github.com/ggerganov/llama.cpp/pull/4406){target="_blank"}.

As the model is quite large, even in its quantized form, which is available on [TheBloke's page](https://huggingface.co/TheBloke/Mixtral-8x7B-v0.1-GGUF){target="_blank"}, you'll need at least 18 GB of memory.

Here's a quick guide on how to get started, you'll have to search for more details yourself.
- Llama.cpp provides information on how to build for any systems on the GitHub page
- TheBloke provides already quantized models in GGUF formats on HuggingFace for basically 99% of all models out there

Since I am using Fedora and want to take advantage of my GPU, I need to install ROCm. The easiest route I've found to build Llama.cpp is to use Docker.

Here's my Dockerfile:
```dockerfile
FROM rocm/dev-ubuntu-22.04:5.7-complete

WORKDIR /app

RUN apt update && apt install -y cmake

COPY . ./

# 'gfx1100' is for a RX 7900 XT or XTX, you may have to look the name for your specific model

RUN mkdir build && \
    cd build && \
    CC=/opt/rocm/llvm/bin/clang CXX=/opt/rocm/llvm/bin/clang++ cmake .. -DLLAMA_HIPBLAS=ON -DAMDGPU_TARGETS=gfx1100 && \
    cmake --build . --config Release -j $(nproc)

STOPSIGNAL SIGKILL
ENV PATH="/app:$PATH"

WORKDIR /app/build/bin

CMD [ "./main" ]
```

Then I have a docker-compose.yml file to start the server easily:
```yaml
version: "3.8"

services:
  llama:
    build: .
    devices:
      - /dev/dri
      - /dev/kfd
    security_opt:
      - seccomp:unconfined
    group_add:
      - video
    volumes:
      - '/run/media/data/Llama/models:/app/build/bin/models'
    ports:
      - "8080:8080"
    command: ./server -m models/mixtral-8x7b-v0.1.Q3_K_M.gguf -ngl 100  # ngl tells llama.cpp to offload all the layers to the GPU
```
