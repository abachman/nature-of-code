import random
import time


def gen(
    letters: list[str], word: list[str], attempt: list[str], depth: int, word_len: int
) -> bool:
    if depth == word_len:
        i = 0
        while i < word_len and attempt[i] == word[i]:
            i += 1
        return i == word_len
    else:
        attempt[depth] = random.choice(letters)
        return gen(letters, word, attempt, depth + 1, word_len)


if __name__ == "__main__":
    start = time.time()
    letters = list("abcdefghijklmnopqrstuvwxyz")
    word = list("paste")
    word_len = len(word)
    found = False
    attempts = 0
    try:
        while not found:
            found = gen(letters, word, [None for i in range(word_len)], 0, word_len)
            attempts += 1
            if attempts % 100_000 == 0:
                print(".", end="", flush=True)
        print(f"found '{''.join(word)}' in {attempts} attempts,", end=" ")
    except KeyboardInterrupt:
        print(f"exiting after {attempts} attempts,", end=" ")

    finish = time.time()
    ms = (finish - start) * 1000
    print(f"took {ms:.4f}ms, {attempts / ms:.2f} a/ms")
